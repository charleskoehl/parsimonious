import {merge, pick} from 'lodash'

const umk = {useMasterKey: true}

export default {
  /**
   * Get some columns from a Parse object and returns them in a js object
   * @param {Parse.Object} parseObj
   * @param {(string|string[])} keys
   * @returns {object}
   */
  objPick: (parseObj, keys) => {
    const keysArr = Array.isArray(keys) ? keys : keys.split(',')
    return pick(toJsn(parseObj), keysArr)
  },
  /**
   * Sets some columns on a Parse object from a js object..
   * Mutates parseObj
   * @param {Parse.Object} parseObj
   * @param {array|string} keys
   */
  objSetMulti: (parseObj, dataObj, doMerge = false) => {
    let key, newVal
    for (key in dataObj) {
      newVal = dataObj[key]
      if (doMerge) {
        newVal = merge(parseObj.get(key), newVal)
      }
      parseObj.set(key, newVal)
    }
  },
  toJsn: parseObj => parseObj && parseObj.toJSON(),
  newQuery: className => new Parse.Query(className),
  getObjById: (className, id, useMasterKey = false) => newQuery('User').get(id, useMasterKey && umk),
  getUserById: (id, useMasterKey = false) => getObjById('User', id, useMasterKey)
}
