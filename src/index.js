'use strict'

const pick = require('lodash/pick')
const merge = require('lodash/merge')

// Active Parse instance is global.Parse in cloud code, or the cached require-ed Parse in clients:
const MyParse = global.Parse || require('parse')

const umk = {useMasterKey: true}

/**
 * Singleton class for using Parse in cloud code or client.
 */
class Parsimonious {
  
  constructor() {
    if(!Parsimonious.instance) {
      Parsimonious.instance = this
    }
    return Parsimonious.instance
  }
  
  /**
   * Get some columns from a Parse object and return a javascript object
   * @param {Parse.Object} parseObj
   * @param {(string|string[])} keys
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
   * @param {array|string} keys
   * @returns {Parse.Object}
   */
  objSetMulti(parseObj, dataObj, doMerge) {
    let key, newVal
    for (key in dataObj) {
      newVal = dataObj[key]
      if (doMerge) {
        newVal = merge(parseObj.get(key), newVal)
      }
      parseObj.set(key, newVal)
      return parseObj
    }
  }
  
  /**
   * Return Parse.Object converted to JSON, or null if no Parse object passed.
   * @param {Parse.Object} parseObj
   * @returns {object}
   */
  toJsn(parseObj) {
    return parseObj && parseObj.toJSON() || null
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
   * @param {bool} useMasterKey (cloud code only)
   */
  getObjById(className, id, useMasterKey) {
    return this.newQuery(className).get(id, useMasterKey && umk)
  }
  
  /**
   * Return Parse.User instance from user id
   * @param {string} id
   * @param {bool} useMasterKey (cloud code only)
   * @returns {Parse.User}
   */
  getUserById(id, useMasterKey) {
    return this.getObjById('User', id, useMasterKey)
  }
  
}

const instance = new Parsimonious()
Object.freeze(instance)

module.exports = instance