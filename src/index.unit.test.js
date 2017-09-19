import Parse from 'Parse'
import parsm from './index'

const TheParseObj = Parse.Object.extend('TheParseObj')
const aParseObj = new TheParseObj()
aParseObj.set('roses', 'red')
aParseObj.set('violets', 'blue')
aParseObj.set('grass', 'green')

expect.extend({
  toBeEquivalentObject(received, argument) {
    if(this.equals(received, argument)) {
      return {
        message: () => (`expected ${received} to not contain the same properties and values as ${argument}`),
        pass: true
      }
    } else {
      return {
        message: () => (`expected ${received} to contain the same properties and values as ${argument}`),
        pass: false
      }
    }
  }
})

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
      const myColors = new Colors()
      myColors.set('roses', 'red')
      myColors.set('violets', 'blue')
      myColors.set('grass', 'green')
      myColors.set('objectId', 'iei38s')
      const someObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        colors: myColors
      }
      const json = parsm.toJsn(someObj, true)
      expect(json.foo).toEqual('bar')
      expect(json.domo).toEqual('arigato')
      expect(json.things).toEqual(['cow', 'pencil'])
      expect(json.colors.grass).toEqual('green')
      expect(json.colors.roses).toEqual('red')
      expect(json.colors.violets).toEqual('blue')
      expect(json.colors.id).toEqual('iei38s')
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