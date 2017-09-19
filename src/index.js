'use strict'

const Parse = require('parse')
const autoBind = require('auto-bind')
const merge = require('lodash/merge')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const isEmpty = require('lodash/isEmpty')
const isPlainObject = require('lodash/isPlainObject')
const isObjectLike = require('lodash/isObjectLike')
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
   * @param {bool} deep If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.
   * @returns {*}
   */
  toJsn(thing, deep=false) {
    let obj
    if(this.isPFObject(thing)) {
      obj = thing.toJSON()
    } else if(isPlainObject(thing) && isObjectLike(thing)) {
      obj = Object.assign({}, thing)
    } else {
      obj = clone(thing)
    }
    if(deep && isPlainObject(obj) && isObjectLike(obj)) {
      // Make more plain-object-like, and prevent Parse.Cloud.run from converting back into Parse.Object in responses:
      if(obj.objectId) {
        obj.id = obj.objectId
      }
      obj = omit(obj,['objectId','__type','className','ACL'])
      // Convert all other properties of plain object to json.
      for(let k in obj) {
        obj[k] = this.toJsn(obj[k], deep)
      }
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
   * @param {bool} doMerge If true, each column value is shallow-merged with existing value
   */
  objSetMulti(parseObj, dataObj, doMerge) {
    if(this.isPFObject(parseObj) && isPlainObject(dataObj)) {
      let key, oldVal, newVal
      for (key in dataObj) {
        oldVal = parseObj.get(key)
        newVal = dataObj[key]
        if (doMerge && isPlainObject(oldVal)) {
          newVal = merge(oldVal, newVal)
        }
        parseObj.set(key, newVal)
      }
    }
  }
  
  /**
   * Return a plain object containing one of the following:
   *    null
   *    {userMasterKey: true}
   *    {sessionToken: <string>}
   * @param {bool=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   * @returns {object|null}
   */
  getMkStOpts(useMasterKey=false, sessionToken=null) {
    return useMasterKey ? umk : (sessionToken ? {sessionToken} : null)
  }
  
  /**
   * Return a new Parse.Query instance from a Parse Object class name.
   * @param {string} className
   * @params {object=} opts Options: skip, limit
   * @returns {Parse.Query}
   */
  newQuery(className, opts={}) {
    const q = new MyParse.Query(className)
    typeof opts.skip === 'number' && opts.skip >= 1 && q.skip(Math.floor(opts.skip))
    typeof opts.limit === 'number' && opts.limit >= 1 && q.limit(Math.floor(opts.limit))
    return q
  }
  
  /**
   * Return a Parse.Object instance from className and id.
   * @param {string} className
   * @param {string} id
   * @param {bool=} useMasterKey Cloud code only
   * @param {string=} sessionToken
   */
  getObjById(className, id, useMasterKey=false, sessionToken) {
    return this.newQuery(className).get(id, this.getMkStOpts(useMasterKey, sessionToken))
  }
  
  /**
   * Return Parse.User instance from user id
   * @param {string} id
   * @param {bool} useMasterKey Cloud code only
   * @returns {Parse.User}
   */
  getUserById(id, useMasterKey=false, sessionToken) {
    return this.getObjById('User', id, useMasterKey, sessionToken)
  }
  
  userHasRole(user, roleName, useMasterKey=false, sessionToken) {
    const roleQuery = new MyParse.Query(MyParse.Role)
    roleQuery.equalTo('name', roleName)
    roleQuery.equalTo('users', user)
    return roleQuery.first(this.getMkStOpts(useMasterKey, sessionToken))
      .then( result => !isEmpty(result) )
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
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
   * @param {bool} useMasterKey
   * @returns {Promise}
   */
  joinWithTable(classes, metadata, useMasterKey=false, sessionToken) {
    const classNames = Object.keys(classes)
    const classInstances = Object.values(classes)
    const joinTableName = this.getJoinTableName(classNames[0], classNames[1])
    const joinObj = this.getClassInst(joinTableName)
    joinObj.set(lowerFirst(classNames[0]), classInstances[0])
    joinObj.set(lowerFirst(classNames[1]), classInstances[1])
    if(metadata) {
      this.objSetMulti(joinObj, metadata)
    }
    return joinObj.save(null, this.getMkStOpts(useMasterKey, sessionToken))
  }
  
  /**
   * Unjoin two parse objects currently joined by a document in a third join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names,
   * except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {bool} useMasterKey
   * @returns {Promise}
   */
  unJoinWithTable(classes, useMasterKey=false, sessionToken) {
    return this.getJoinQuery(classes)
      .first()
      .then( joinObj => {
        if(this.isPFObject(joinObj)) {
          return joinObj.destroy(this.getMkStOpts(useMasterKey, sessionToken))
        } else {
          return MyParse.Promise.as(null)
        }
      })
  }
  
  /**
   * Return a query on a join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes; at least one value must be a valid parse object; the other may be a valid parse object or null.
   * @param {string=} selects - comma-separated list of keys to retrieve
   * @params {object=} opts Options: skip, limit
   * @returns {Parse.Query}
   */
  getJoinQuery(classes, selects, opts) {
    const classNames = Object.keys(classes)
    const classInstances = Object.values(classes)
    const query = this.newQuery(this.getJoinTableName(classNames[0], classNames[1]), opts)
    classInstances[0] && query.equalTo(lowerFirst(classNames[0]), classInstances[0])
    classInstances[1] && query.equalTo(lowerFirst(classNames[1]), classInstances[1])
    selects && query.select(selects)
    return query
  }
  
  /**
   * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)
   * @param {*} thing
   * @returns {boolean}
   */
  isPFObject(thing) {
    return thing !== null
      && typeof thing === 'object'
      && typeof thing._objCount === 'number'
      && typeof thing.className === 'string'
  }
  
}

const instance = new Parsimonious()
Object.freeze(instance)

export default instance