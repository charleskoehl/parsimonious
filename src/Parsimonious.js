'use strict'

import autoBind from 'auto-bind'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import get from 'lodash/get'
import omit from 'lodash/omit'
import isInteger from 'lodash/isInteger'
import isEqual from 'lodash/isEqual'
import isPlainObject from 'lodash/isPlainObject'
import clone from 'lodash/clone'
import lowerFirst from 'lodash/lowerFirst'

/**
 * Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.
 * @module Parsimonious
 */

const specialClasses = ['User', 'Role', 'Session']

export default class Parsimonious {
  
  constructor(parse) {
    if(!Parsimonious.instance) {
      autoBind(this)
      Parsimonious.instance = this
      this.Parse = parse
    }
    return Parsimonious.instance
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
    const q = new this.Parse.Query(aClass)
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
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @returns {Parse.User}
   */
  getUserById(id, opts) {
    return this.getObjById('User', id, opts)
  }
  
  /**
   * Given a value thing, return a promise that resolves to
   *   thing if thing is a clean Parse.Object,
   *   fetched Parse.Object if thing is a dirty Parse.Object,
   *   fetched Parse.Object if thing is a pointer;
   *   thing if otherwise
   * @param {*} thing
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @return {Parse.Promise} Promise that fulfills with saved UserPrefs object.
   */
  fetchIfNeeded(thing, opts) {
    if(this.isPFObject(thing)) {
      return thing.dirty() ? thing.fetch(opts) : this.Parse.Promise.as(thing)
    } else if(this.isPointer(thing) && typeof thing.className === 'string') {
      return this.getObjById(thing.className, thing.objectId, opts)
    } else {
      return this.Parse.Promise.as(thing)
    }
  }
  
  getRole(name, opts) {
    return this.newQuery(this.Parse.Role)
      .equalTo('name', name)
      .first(opts)
  }
  
  /**
   * Return array of names of user's direct roles, or empty array.
   * Requires that the Roles class has appropriate read permissions.
   * @param {Parse.User} user
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @return {Parse.Promise}
   */
  getUserRoles(user, opts) {
    return this.newQuery(this.Parse.Role)
      .equalTo('users', user)
      .find(opts)
      .then(roles => Array.isArray(roles) && roles.length > 0 ? roles.map(role => role.get('name')) : [])
  }
  
  /**
   * Check if a user has a role, or any or all of multiple roles, return a promise resolving to true or false.
   * @param {Parse.User} user
   * @param {string|object} roles Can be single role name string, or object containing 'names' key whose value is an array of role names and 'op' key with value 'and' or 'or'
   * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
   * @return {Parse.Promise}
   */
  userHasRole(user, roles, opts) {
    if(!this.isUser(user)) {
      throw 'no user'
    }
    const roleQuery = this.newQuery(this.Parse.Role)
      .equalTo('users', user)
    if(typeof roles === 'string') {
      roleQuery.equalTo('name', roles)
      return roleQuery.first(opts)
        .then(result => result !== undefined)
    } else if(isPlainObject(roles) && Array.isArray(roles.names) && roles.op) {
      roleQuery.containedIn('name', roles.names)
      return roleQuery.count(opts)
        .then(result => roles.op === 'and' ? result === roles.names.length : result > 0)
    } else {
      throw 'invalid roles'
    }
  }
  
  /**
   * Short-hand for this.Parse.Object.extend(className)
   * @param {string} className
   * @returns subclass of Parse.Object
   */
  getClass(className) {
    return this.Parse.Object.extend(className)
  }
  
  /**
   * Return instance of Parse.Object class.
   * @param {string} className
   * @param {object=} attributes Properties to set on new object.
   * @param {object=} options Options to use when creating object.
   * @returns {Parse.Object}
   */
  getClassInst(className, attributes, options) {
    const Cls = this.getClass(className)
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
   * @returns {Parse.Promise}
   */
  joinWithTable(classes, metadata=null, opts) {
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
   * @returns {Parse.Promise}
   */
  unJoinWithTable(classes, opts) {
    return this.getJoinQuery(classes, opts)
      .first()
      .then(joinObj => {
        if(this.isPFObject(joinObj)) {
          return joinObj.destroy(opts)
        } else {
          return this.Parse.Promise.as(undefined)
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
  
  
  /* TYPE CHECKS  */
  
  
  /**
   * Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.
   * @param thing
   * @returns {boolean}
   */
  isPointer(thing) {
    if(typeof thing === 'object' && thing !== null) {
      const keys = Object.keys(thing)
      return (
        (
          isEqual(keys, ['__type', 'className', 'objectId'])
          && thing.__type === 'Pointer'
          && typeof thing.objectId === 'string'
          && typeof thing.className === 'string'
        )
        || (
          isEqual(keys, ['className', '_objCount', 'id'])
          && typeof thing.className === 'string'
          && typeof thing.id === 'string'
        ) || (
          isEqual(keys, ['objectId'])
          && typeof thing.objectId === 'string'
        )
      )
    }
    return false
  }
  
  /**
   * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)
   * @param {*} thing
   * @param {string=} ofClass
   * @returns {boolean}
   */
  isPFObject(thing, ofClass) {
    return thing !== null
      && typeof thing === 'object'
      && typeof thing._objCount === 'number'
      && typeof thing.className === 'string'
      // Check if correct class if specified.
      && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true)
  }
  
  /**
   * Return true if thing is an instance of Parse.User.
   * @param {*} thing
   * @returns {boolean}
   */
  isUser(thing) {
    return this.isPFObject(thing, 'User')
  }
  
  
  /* CONVERSIONS / DATA MANIPULATION */
  
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
   * If keys is not an array or comma-separated string, return undefined.
   * @param {Parse.Object} parseObj
   * @param {(string | string[])} keys
   * @returns {object}
   */
  objPick(parseObj, keys) {
    return pick(this.toJsn(parseObj), this._toArray(keys))
  }
  
  /**
   * Get an an object-type column from a Parse object and return the value of a nested key within it.
   * @param {Parse.Object} parseObj
   * @param {string} columnAndPath Dot-notation path whose first segment is the column name.
   * @returns {*}
   */
  objGetDeep(parseObj, columnAndPath) {
    if(typeof columnAndPath === 'string') {
      const
        [column, path] = columnAndPath.split(/\.(.+)/),
        columnVal = parseObj.get(column)
      if(isPlainObject(columnVal)) {
        return get(columnVal, path)
      }
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
   * Returns valid class-name when passed either a subclass of Parse.Object or any string.
   * Removes the underscore if it is one of the special classes with a leading underscore.
   * Returns undefined if anything else.
   *
   * @param {object|string} thing
   * @return {string}
   */
  getPFObjectClassName(thing) {
    const str = typeof thing === 'string' ? thing : (this.isPFObject(thing) ? thing.className : null)
    if(typeof str === 'string') {
      return str.substring(0,1) === '_' && specialClasses.indexOf(str.substring(1)) !== -1 ? str.substring(1) : str
    }
  }
  
  /**
   * Return array from array or comma-separated string list.
   * If passed a non-string, non-array value, returns it in an array.
   * @param {array|string} thing
   * @returns {any}
   * @private
   */
  _toArray(thing) {
    return Array.isArray(thing) ? thing : (typeof thing === 'string' ? thing.split(',') : [thing])
  }
  
}