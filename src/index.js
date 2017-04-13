const pick = require('lodash/pick')
const merge = require('lodash/merge')

const umk = {useMasterKey: true}

class Parsimonious {
  
  constructor() {
    if(!Parsimonious.instance) {
      Parsimonious.instance = this
    }
    return Parsimonious.instance
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
  objSetMulti(parseObj, dataObj, doMerge = false) {
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
    new Parse.Query(className)
  }
  
  getObjById(className, id, useMasterKey = false) {
    return this.newQuery('User').get(id, useMasterKey && umk)
  }
  
  getUserById(id, useMasterKey = false) {
    return this.getObjById('User', id, useMasterKey)
  }
  
}

const instance = new Parsimonious()
Object.freeze(instance)

export default instance