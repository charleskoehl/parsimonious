'use strict'

const Parse = require('parse')
const autoBind = require('auto-bind')
const merge = require('lodash/merge')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const isPlainObject = require('lodash/isPlainObject')
const cloneDeep = require('lodash/cloneDeep')
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
   * Get some columns from a Parse object and return a javascript object
   * @param {Parse.Object} parseObj
   * @param {(string | string[])} keys
   * @returns {object}
   */
  objPick(parseObj, keys) {
    const keysArr = Array.isArray(keys) ? keys : keys.split(',')
    return pick(this.toJsn(parseObj), keysArr)
  }
  
  /**
   * Set some columns on a Parse object from a javascript object
   * Mutates the Parse object.
   * @param {Parse.Object} parseObj
   * @param {object} dataObj
   * @param {bool} doMerge If true, each column value is shallow-merged with existing value
   */
  objSetMulti(parseObj, dataObj, doMerge) {
    if(this.isPFObject(parseObj) && typeof dataObj === 'object') {
      let key, newVal
      for (key in dataObj) {
        newVal = dataObj[key]
        if (doMerge) {
          newVal = merge(parseObj.get(key), newVal)
        }
        parseObj.set(key, newVal)
      }
    }
  }
  
  /**
   * Convert object to json map, whether it is an instance or subclass instance of Parse.Object,
   * or a plain object that might contain instances or subclass instances of Parse.Object's.
   * Has no effect on plain objects unless deep == true.
   * @param {object|Parse.Object} obj
   * @param {bool} deep
   * @returns {*}
   */
  toJsn(obj, deep=false) {
    let result
    if(this.isPFObject(obj)) {
      result = obj.toJSON()
    } else {
      result = cloneDeep(obj)
    }
    if(deep && isPlainObject(result)) {
      result.id = result.objectId
      result = omit(result,['objectId','__type','className','ACL'])
      for(let k in result) {
        result[k] = this.toJsn(result[k], deep)
      }
    }
    return result
  }
  
  /**
   * Return a new Parse.Query instance from a Parse Object class name
   * @param {string} className
   * @returns {Parse.Query}
   */
  newQuery(className) {
    return new MyParse.Query(className)
  }
  
  /**
   * Return a Parse.Object instance from className and id
   * @param {string} className
   * @param {string} id
   * @param {bool} useMasterKey Cloud code only
   */
  getObjById(className, id, useMasterKey) {
    return this.newQuery(className).get(id, useMasterKey && umk)
  }
  
  /**
   * Return Parse.User instance from user id
   * @param {string} id
   * @param {bool} useMasterKey Cloud code only
   * @returns {Parse.User}
   */
  getUserById(id, useMasterKey) {
    return this.getObjById('User', id, useMasterKey)
  }
  
  /**
   * Return instance of Parse.Object class
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
   * Join table must exist and have pointer columns named like class names
   * except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
   * @param {bool} useMasterKey
   * @returns {Promise}
   */
  joinWithTable(classes, metadata, useMasterKey=false) {
    const classNames = Object.keys(classes)
    const classInstances = Object.values(classes)
    const joinTableName = this.getJoinTableName(classNames[0], classNames[1])
    const joinObj = this.getClassInst(joinTableName)
    joinObj.set(lowerFirst(classNames[0]), classInstances[0])
    joinObj.set(lowerFirst(classNames[1]), classInstances[1])
    if(metadata) {
      this.objSetMulti(joinObj, metadata)
    }
    return joinObj.save(null, useMasterKey && umk)
  }
  
  /**
   * Unjoin two parse objects currently joined by a document in a third join table.
   * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
   * Join table must exist and have pointer columns named like class names
   * except first letter lower-case; e.g.: employee, company.
   * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
   * @param {bool} useMasterKey
   * @returns {Promise}
   */
  unJoinWithTable(classes, useMasterKey=false) {
    return this.getJoinQuery(classes)
      .first()
      .then( joinObj => {
        if(this.isPFObject(joinObj)) {
          return joinObj.destroy(useMasterKey && umk)
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
   * @returns {Parse.Query}
   */
  getJoinQuery(classes, selects) {
    const classNames = Object.keys(classes)
    const classInstances = Object.values(classes)
    const query = this.newQuery(this.getJoinTableName(classNames[0], classNames[1]))
    if(classInstances[0]) {
      query.equalTo(lowerFirst(classNames[0]), classInstances[0])
    }
    if(classInstances[1]) {
      query.equalTo(lowerFirst(classNames[1]), classInstances[1])
    }
    if(selects) {
      query.select(selects)
    }
    return query
  }
  
  /**
   * Return true if thing is a Parse.Object
   * @param {*} thing
   * @returns {boolean}
   */
  isPFObject(thing) {
    return typeof thing === 'object'
      && typeof thing.toJSON === 'function'
      && typeof thing.toPointer === 'function'
  }
  
}

const instance = new Parsimonious()
Object.freeze(instance)

export default instance