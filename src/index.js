'use strict'

const Parse = require('parse')
const autoBind = require('auto-bind')
const merge = require('lodash/merge')
const pick = require('lodash/pick')
const omit = require('lodash/omit')

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
    if(this.isPFObject(obj)) {
      obj = obj.toJSON()
    }
    if(deep && typeof obj === 'object') {
      obj.id = obj.objectId
      obj = omit(obj,['objectId','__type','className'])
      for(let k in obj) {
        obj[k] = this.toJsn(obj[k], deep)
      }
    }
    return obj
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