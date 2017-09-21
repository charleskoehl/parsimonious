'use strict'

const Parse = require('parse')
const autoBind = require('auto-bind')
const merge = require('lodash/merge')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const isInteger = require('lodash/isInteger')
const isPlainObject = require('lodash/isPlainObject')
const clone = require('lodash/clone')
const lowerFirst = require('lodash/lowerFirst')

/**
 * Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.
 * @module Parsimonious
 */

// Active Parse instance is global.Parse in cloud code, or the cached require-ed Parse in clients:
const MyParse = global.Parse || Parse

const umk = {useMasterKey: true}

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
  toJsn(thing, deep=false) {
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
      obj = omit(obj,['objectId','__type','className','ACL'])
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
    if(typeof keys === 'string' || Array.isArray(keys)) {
      const keysArr = Array.isArray(keys) ? keys : keys.split(',')
      return pick(this.toJsn(parseObj), keysArr)
    }
  }
  
  /**
   * Set some columns on a Parse object. Mutates the Parse object.
   * @param {Parse.Object} parseObj
   * @param {object} dataObj
   * @param {boolean=} doMerge If true, each column value is shallow-merged with existing value
   */
  objSetMulti(parseObj, dataObj, doMerge=false) {
    if(this.isPFObject(parseObj) && isPlainObject(dataObj)) {
      let key, oldVal, newVal
      for (key in dataObj) {
        oldVal = parseObj.get(key)
        newVal = dataObj[key]
        if (doMerge && isPlainObject(oldVal) && isPlainObject(newVal)) {
          newVal = merge(oldVal, newVal)
        }
        parseObj.set(key, newVal)
      }
    }
  }
  
  /**
   * Return a new Parse.Query instance from a Parse Object class name.
   * @param {string} className
   * @param {object=} opts Options: skip, limit
   * @returns {Parse.Query}
   */
  newQuery(className, opts=undefined) {
    const q = new MyParse.Query(className)
    if(opts !== undefined && isPlainObject(opts)) {
      isInteger(opts.skip) && opts.skip > 0 && q.skip(opts.skip)
      isInteger(opts.limit) && opts.limit > 0 && q.limit(opts.limit)
    }
    return q
  }
  
  /**
   * Return a Parse.Object instance from className and id.
   * @param {string} className
   * @param {string} id
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   */
  getObjById(className, id, useMasterKey=false, sessionToken=null) {
    return this.newQuery(className).get(id, this._getMkStOpts(useMasterKey, sessionToken))
  }
  
  /**
   * Return Parse.User instance from user id
   * @param {string} id
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @returns {Parse.User}
   */
  getUserById(id, useMasterKey=false, sessionToken) {
    return this.getObjById('User', id, useMasterKey, sessionToken)
  }
  
  /**
   *
   * @param {Parse.User}  user
   * @param {string}      roleName
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @return {Promise.<TResult>|Parse.Promise}
   */
  userHasRole(user, roleName, useMasterKey=false, sessionToken) {
    const roleQuery = new MyParse.Query(MyParse.Role)
    roleQuery.equalTo('name', roleName)
    roleQuery.equalTo('users', user)
    return roleQuery.first(this._getMkStOpts(useMasterKey, sessionToken))
      .then( result => result !== undefined )
  }
  
  /**
   * Return instance of Parse.Object class.
   * @param {string} className
   * @returns {Parse.Object}
   */
  getClassInst(className) {
    const Cls = MyParse.Object.extend(className)
    return new Cls()
  }
  
  /**
   * Return the name of a table used to join two Parse.Object classes.
   * @param {string} from First class name
   * @param {string} to Second class name
   * @returns {string}
   */
  getJoinTableName(from, to) {
    return `${from}2${to}`
  }
  
  /**
   * Join two parse objects by adding a document to a third join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names,
   * except first letter lower-case; e.g.: employee, company.
   * Returns promise.
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @returns {Promise}
   */
  joinWithTable(classes, metadata=null, useMasterKey=false, sessionToken=null) {
    const classNames = Object.keys(classes)
    const classInstances = [classes[classNames[0]],classes[classNames[1]]]
    const joinTableName = this.getJoinTableName(classNames[0], classNames[1])
    const joinObj = this.getClassInst(joinTableName)
    joinObj.set(lowerFirst(classNames[0]), classInstances[0])
    joinObj.set(lowerFirst(classNames[1]), classInstances[1])
    if(isPlainObject(metadata)) {
      this.objSetMulti(joinObj, metadata)
    }
    return joinObj.save(null, this._getMkStOpts(useMasterKey, sessionToken))
  }
  
  /**
   * Unjoin two parse objects currently joined by a document in a third join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names,
   * except first letter lower-case; e.g.: employee, company.
   * If can't unjoin objects, returned promise resolves to undefined.
   * @param {object} classes - must contain two keys corresponding to existing classes;
   *                           each value must be a valid parse object already in db.
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @returns {Promise}
   */
  unJoinWithTable(classes, useMasterKey=false, sessionToken=null) {
    return this.getJoinQuery(classes)
      .first()
      .then( joinObj => {
        if(this.isPFObject(joinObj)) {
          return joinObj.destroy(this._getMkStOpts(useMasterKey, sessionToken))
        } else {
          return MyParse.Promise.as(undefined)
        }
      })
  }
  
  /**
   * Return a query on a join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes;
   *                           each value must be either a valid parse object or null
   * @param {(string | string[])=} select - comma-separated list, or array, of keys to retrieve
   * @params {object=} opts Options: skip, limit
   * @returns {Parse.Query}
   */
  getJoinQuery(classes, select, opts) {
    const classNames = Object.keys(classes)
    const classInstances = [classes[classNames[0]],classes[classNames[1]]]
    const query = this.newQuery(this.getJoinTableName(classNames[0], classNames[1]), opts)
    this.isPFObject(classInstances[0], classNames[0]) && query.equalTo(lowerFirst(classNames[0]), classInstances[0])
    this.isPFObject(classInstances[1], classNames[1]) && query.equalTo(lowerFirst(classNames[1]), classInstances[1])
    let selectArray
    if(Array.isArray(select) && select.length) {
      selectArray = select
    } else if(typeof select === 'string') {
      selectArray = select.split(',')
    }
    Array.isArray(selectArray) && query.select(selectArray)
    return query
  }
  
  /**
   * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)
   * @param {*} thing
   * @param {string=} ofClass
   * @returns {boolean}
   */
  isPFObject(thing, ofClass=null) {
    const specialClasses = ['User','Role','Session']
    return thing !== null
      && typeof thing === 'object'
      && typeof thing._objCount === 'number'
      && typeof thing.className === 'string'
      // Check if correct class if specified.
      && (typeof ofClass === 'string' ? (thing.className === ofClass || (specialClasses.indexOf(ofClass) > -1 && thing.className === `_${ofClass}`)) : true)
  }
  
  /**
   * Return a plain object containing one of the following:
   *    null
   *    {userMasterKey: true}
   *    {sessionToken: <string>}
   * @param {boolean=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @returns {object|null}
   */
  _getMkStOpts(useMasterKey=false, sessionToken=null) {
    return useMasterKey ? umk : (sessionToken ? {sessionToken} : {})
  }
  
}

const instance = new Parsimonious()
Object.freeze(instance)

export default instance