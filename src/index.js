'use strict'

const pick = require('lodash/pick')
const merge = require('lodash/merge')

const umk = {useMasterKey: true}

class Parsimonious {
  
  setParse(parse) {
    this.parse = parse
  }
  
  /**
   * Get some columns from a Parse object and returns them in a js object
   * @param {Parse.Object} parseObj
   * @param {(string|string[])} keys
   * @returns {object}
   */
  objPick(parseObj, keys) {
    const keysArr = Array.isArray(keys) ? keys : keys.split(',')
    return pick(this.toJsn(parseObj), keysArr)
  }
  
  /**
   * Sets some columns on a Parse object from a js object..
   * Mutates parseObj
   * @param {Parse.Object} parseObj
   * @param {array|string} keys
   */
  objSetMulti(parseObj, dataObj, doMerge) {
    let key, newVal
    for (key in dataObj) {
      newVal = dataObj[key]
      if (doMerge) {
        newVal = merge(parseObj.get(key), newVal)
      }
      parseObj.set(key, newVal)
    }
  }
  
  toJsn(parseObj) {
    return parseObj && parseObj.toJSON()
  }
  
  newQuery(className) {
    const theClass = this.parse.Object.extend(className)
    return new this.parse.Query(theClass)
  }
  
  getObjById(className, id, useMasterKey) {
    return this.newQuery(className).get(id, useMasterKey && umk)
  }
  
  getUserById(id, useMasterKey) {
    return this.getObjById('User', id, useMasterKey)
  }
  
}

module.exports = new Parsimonious()