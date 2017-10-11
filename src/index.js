'use strict'

import Parse from 'parse-shim'
import autoBind from 'auto-bind'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import omit from 'lodash/omit'
import isInteger from 'lodash/isInteger'
import isPlainObject from 'lodash/isPlainObject'
import clone from 'lodash/clone'
import lowerFirst from 'lodash/lowerFirst'

/**
 * Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.
 * @module Parsimonious
 */

// Active Parse instance is global.Parse in cloud code, or the cached require-ed Parse in clients:
const MyParse = global.Parse || Parse
const specialClasses = ['User', 'Role', 'Session']

/**
 * @class
 */
class Parsimonious {
  
  constructor() {
    if(!Parsimonious.instance) {
      autoBind(this)
      Parsimonious.instance = this
    }
    return Parsimonious.instance
  }
  
  /**
   * Return a json representation of a Parse.Object,
   * sub-class of Parse.Object (such as Parse.User),
   * or plain object containing any or none of those, to json, optionally recursively.
   * Does not mutate parameters.
   *
   * @param {*} thing Value to create json from.
   * @param {boolean=} deep If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.
   * @returns {*}
   */
  toJsn(thing, deep = false) {
    let obj
    if(this.isPFObject(thing)) {
      obj = thing.toJSON()
    } else if(isPlainObject(thing)) {
      obj = Object.assign({}, thing)
    } else {
      obj = clone(thing)
    }
    if(deep && isPlainObject(obj)) {
      // Make more plain-object-like, and prevent Parse.Cloud.run from converting back into Parse.Object in responses:
      if(obj.objectId) {
        obj.id = obj.objectId
      }
      obj = omit(obj, ['objectId', '__type', 'className', 'ACL'])
      // Convert all other properties of plain object to json.
      Object.keys(obj).forEach(k => {
        obj[k] = this.toJsn(obj[k], deep)
      })
    }
    return obj
  }
  
  /**
   * Get some columns from a Parse object and return them in a plain object.
   * @param {Parse.Object} parseObj
   * @param {(string | string[])} keys
   * @returns {object}
   */
  objPick(parseObj, keys) {
    const keysArr = this._toArray(keys)
    if(Array.isArray(keysArr)) {
      return pick(this.toJsn(parseObj), keysArr)
    }
  }
  
  /**
   * Set some columns on a Parse object. Mutates the Parse object.
   * @param {Parse.Object} parseObj
   * @param {object} dataObj
   * @param {boolean=} doMerge If true, each column value is shallow-merged with existing value
   */
  objSetMulti(parseObj, dataObj, doMerge = false) {
    if(this.isPFObject(parseObj) && isPlainObject(dataObj)) {
      let key, oldVal, newVal
      for(key in dataObj) {
        oldVal = parseObj.get(key)
        newVal = dataObj[key]
        if(doMerge && isPlainObject(oldVal) && isPlainObject(newVal)) {
          newVal = merge(oldVal, newVal)
        }
        parseObj.set(key, newVal)
      }
    }
  }
  
  /**
   * Return a new Parse.Query instance from a Parse Object class name.
   * @param {string|object} aClass class name or constructor
   * @param {object=} opts Query restrictions
   * @param {number=} opts.limit Parameter for Parse.Query.limit. Must be integer greater than zero.
   * @param {number=} opts.skip Parameter for Parse.Query.skip. Must be integer greater than zero.
   * @param {string[]} [opts.select] Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys.
   * @returns {Parse.Query}
   */
  newQuery(aClass, opts = {}) {
    const q = new MyParse.Query(aClass)
    const {skip, limit, select} = opts
    if(isPlainObject(opts)) {
      isInteger(skip) && skip > 0 && q.skip(skip)
      isInteger(limit) && limit > 0 && q.limit(limit)
      let selectArray
      if(Array.isArray(select) && select.length) {
        selectArray = select
      } else if(typeof select === 'string') {
        selectArray = [select]
      }
      Array.isArray(selectArray) && q.select(selectArray)
    }
    return q
  }
  
  /**
   * Return a Parse.Object instance from className and id.
   * @param {string|object} aClass class name or constructor
   * @param {string} id
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   */
  getObjById(aClass, id, opts) {
    return this.newQuery(aClass).get(id, opts)
  }
  
  /**
   * Return Parse.User instance from user id
   * @param {string} id
   * @param {object=} opts A A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @returns {Parse.User}
   */
  getUserById(id, opts) {
    return this.getObjById('User', id, opts)
  }
  
  getRole(name, opts) {
    const roleQuery = this.newQuery(Parse.Role)
    roleQuery.equalTo('name', name)
    return roleQuery.first(opts)
  }
  
  /**
   * Check if a user has a role, or any or all of multiple roles, return a promise resolving to true or false.
   * @param {Parse.User} user
   * @param {string|object} roles Can be single role name string, or object containing array of role names and 'op' key of value 'and' or 'or'
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @return {Promise.<TResult>|Parse.Promise}
   */
  userHasRole(user, roles, opts) {
    const roleQuery = new MyParse.Query(MyParse.Role)
    roleQuery.equalTo('users', user)
    if(typeof roles === 'string') {
      roleQuery.equalTo('name', roles)
      return roleQuery.first(opts)
        .then(result => result !== undefined)
    } else if(isPlainObject(roles) && Array.isArray(roles.names) && roles.op) {
      roleQuery.containedIn('name', roles.names)
      return roleQuery.count(opts)
        .then(result => roles.op === 'and' ? result == roles.names.length : result > 0)
    }
  }
  
  /**
   * Return instance of Parse.Object class.
   * @param {string} className
   * @param {object=} attributes Properties to set on new object.
   * @param {object=} options Options to use when creating object.
   * @returns {Parse.Object}
   */
  getClassInst(className, attributes, options) {
    const Cls = MyParse.Object.extend(className)
    return new Cls(attributes, options)
  }
  
  /**
   * Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.
   * @param {string} from First class name
   * @param {string} to Second class name
   * @returns {string}
   */
  getJoinTableName(from, to) {
    return `${from}2${to}`
  }
  
  /**
   * Join two parse objects in a many-to-many relationship by adding a document to a third join table.
   * Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names,
   * except first letter lower-case; e.g.: employee, company.
   * Returns promise.
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @returns {Promise}
   */
  joinWithTable(classes, metadata = null, opts) {
    const classNames = Object.keys(classes)
    const classInstances = [classes[classNames[0]], classes[classNames[1]]]
    const joinTableName = this.getJoinTableName(classNames[0], classNames[1])
    const joinObj = this.getClassInst(joinTableName)
    joinObj.set(lowerFirst(classNames[0]), classInstances[0])
    joinObj.set(lowerFirst(classNames[1]), classInstances[1])
    if(isPlainObject(metadata)) {
      this.objSetMulti(joinObj, metadata)
    }
    return joinObj.save(null, opts)
  }
  
  /**
   * Unjoin two parse objects currently joined in a many-to-many relationship by a document in a third join table.
   * Like Parse.Relation.remove (see Parsimonious.joinWithTable above).
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names,
   * except first letter lower-case; e.g.: employee, company.
   * If can't unjoin objects, returned promise resolves to undefined.
   * @param {object} classes - must contain two keys corresponding to existing classes;
   *                           each value must be a valid parse object already in db.
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @returns {Promise}
   */
  unJoinWithTable(classes, opts) {
    return this.getJoinQuery(classes, opts)
      .first()
      .then(joinObj => {
        if(this.isPFObject(joinObj)) {
          return joinObj.destroy(opts)
        } else {
          return MyParse.Promise.as(undefined)
        }
      })
  }
  
  /**
   * Return a query on a many-to-many join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes, with each key's value being either a valid parse object or null
   * @param {object=} opts Query restrictions (see Parsimonious.newQuery)
   * @returns {Parse.Query}
   */
  getJoinQuery(classes, opts) {
    const classNames = Object.keys(classes)
    const classInstances = [classes[classNames[0]], classes[classNames[1]]]
    const query = this.newQuery(this.getJoinTableName(classNames[0], classNames[1]), opts)
    this.isPFObject(classInstances[0], classNames[0]) && query.equalTo(lowerFirst(classNames[0]), classInstances[0])
    this.isPFObject(classInstances[1], classNames[1]) && query.equalTo(lowerFirst(classNames[1]), classInstances[1])
    return query
  }
  
  /**
   * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)
   * @param {*} thing
   * @param {string=} ofClass
   * @returns {boolean}
   */
  isPFObject(thing, ofClass = null) {
    return thing !== null
      && typeof thing === 'object'
      && typeof thing._objCount === 'number'
      && typeof thing.className === 'string'
      // Check if correct class if specified.
      && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true)
  }
  
  /**
   * Returns the passed string, removing the underscore if it is one of the special classes with a leading underscore
   * @param {string} str
   * @return {string}
   */
  getPFObjectClassName(obj) {
    if(this.isPFObject(obj)) {
      const str = obj.className
      return str.substring(0,1) === '_' && specialClasses.indexOf(str.substring(1)) !== -1 ? str.substring(1) : str
    }
  }
  
  _toArray(thing) {
    if(typeof thing === 'string') {
      return thing.split(',')
    } else if(Array.isArray(thing)) {
      return thing
    }
  }
  
  
}

const instance = new Parsimonious()
Object.freeze(instance)

export default instance
