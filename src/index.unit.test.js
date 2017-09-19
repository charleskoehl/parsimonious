import Parse from 'Parse'
import parsm from './index'

const TheParseObj = Parse.Object.extend('TheParseObj')
const aParseObj = new TheParseObj()
aParseObj.set('roses', 'red')
aParseObj.set('violets', 'blue')
aParseObj.set('grass', 'green')

describe('parsimonious methods', () => {
  
  describe('toJsn', () => {
    it('returns the input when input is not a Parse object or a plain, non-null object', () => {
      const mySymbol = Symbol('test')
      expect(parsm.toJsn(mySymbol)).toEqual(mySymbol)
      expect(parsm.toJsn(undefined)).toEqual(undefined)
      expect(parsm.toJsn(null)).toEqual(null)
      expect(parsm.toJsn(true)).toEqual(true)
      expect(parsm.toJsn(2)).toEqual(2)
      expect(parsm.toJsn('abc')).toEqual('abc')
    })
    it('returns a shallow JSON representation of a Parse object', () => {
      expect(parsm.toJsn(aParseObj)).toBeEquivalentObject({
        roses: 'red',
        violets: 'blue',
        grass: 'green'
      })
    })
    it('returns deep JSON representation of a plain object containing a plain, non-Parse object', () => {
      const plainObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        doohicky: {
          springs: 5,
          levers: 2
        }
      }
      expect(parsm.toJsn(plainObj, true)).toBeEquivalentObject({
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        doohicky: {
          springs: 5,
          levers: 2
        }
      })
    })
    it('returns deep JSON representation of a plain object containing a Parse object', () => {
      const someObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj
      }
      expect(parsm.toJsn(someObj, true)).toBeEquivalentObject({
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj: {
          roses: 'red',
          violets: 'blue',
          grass: 'green'
        }
      })
    })
    it('returns deep JSON representation of a plain object containing a Parse object that has an objectId key', () => {
      aParseObj.set('objectId', 'iei38s')
      const someObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj
      }
      expect(parsm.toJsn(someObj, true)).toBeEquivalentObject({
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj: {
          id: 'iei38s',
          roses: 'red',
          violets: 'blue',
          grass: 'green'
        }
      })
    })
  })
  
  describe('objPick', () => {
    it('gets some columns from a Parse object and returns them in a plain object', () => {
      expect(parsm.objPick(aParseObj, 'roses,grass')).toEqual({
        roses: 'red',
        grass: 'green'
      })
      expect(parsm.objPick(aParseObj, ['roses', 'grass'])).toEqual({
        roses: 'red',
        grass: 'green'
      })
    })
  })
  
  describe('objSetMulti', () => {
    it('sets some columns on a Parse object from a plain object', () => {
      parsm.objSetMulti(aParseObj, {
        valley: 'big',
        river: 'deep'
      })
      expect(aParseObj.get('river')).toBe('deep')
    })
    it('sets some columns on a Parse object from a plain object, not merging sub-objects', () => {
      aParseObj.set('ocean', {
        size:'large',
        color:'blue',
        denizens:'fish'
      })
      parsm.objSetMulti(aParseObj, {
        ocean: {
          size:'medium',
          color:'green'
        }
      })
      expect(aParseObj.get('ocean')).toBeEquivalentObject({
        size:'medium',
        color:'green'
      })
    })
    it('sets some columns on a Parse object from a plain object, merging sub-objects', () => {
      aParseObj.set('ocean', {
        size:'large',
        color:'blue',
        denizens:'fish'
      })
      parsm.objSetMulti(aParseObj, {
        ocean: {
          size:'medium',
          color:'green'
        }
      }, true)
      expect(aParseObj.get('ocean')).toBeEquivalentObject({
        size:'medium',
        color:'green',
        denizens:'fish'
      })
    })
  })
  
  describe('getMkStOpts', () => {
    it('returns null when no params', () => {
      expect(parsm.getMkStOpts()).toEqual(null)
    })
    it('returns null when params are falsy', () => {
      expect(parsm.getMkStOpts(false)).toEqual(null)
      expect(parsm.getMkStOpts(null)).toEqual(null)
      expect(parsm.getMkStOpts(false,null)).toEqual(null)
      expect(parsm.getMkStOpts(null,null)).toEqual(null)
    })
  })
  
  describe('newQuery', () => {
    const query = parsm.newQuery('Colors')
    it('returns a new Parse.Query given a Parse Object class name', () => {
      expect(typeof query === 'object' && query.className === 'Colors' && typeof query.find === 'function').toBe(true)
    })
  })
  
  describe('getObjById', () => {
  
  })
  
  describe('getUserById', () => {
  
  })
  
  describe('userHasRole', () => {
  
  })
  
  describe('getClassInst', () => {
    const inst = parsm.getClassInst('Colors')
    it('returns a subclass of Parse.Object given class name', () => {
      expect(inst.className === 'Colors').toBe(true)
    })
  })
  
  describe('isPFObject', () => {
    it('determines if a variable is a Parse.Object', () => {
      expect(parsm.isPFObject(aParseObj)).toBe(true)
    })
  })
})