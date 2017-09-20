'use strict'

import Parse from 'parse-shim'
import ParseMockDB from 'parse-mockdb'
import parsm from './index'


Parse.initialize('test')

var savedBouquets

beforeAll(() => {
  ParseMockDB.mockDB() // Mock the Parse RESTController
  const bouquets = []
  for(let i = 0; i < 10; i++) {
    bouquets.push(new Parse.Object('Bouquet'))
  }
  return Parse.Object.saveAll(bouquets)
    .then(objs => {
      savedBouquets = objs
    })
})

afterAll(() => {
  ParseMockDB.cleanUp(); // Clear the Database
  ParseMockDB.unMockDB(); // Un-mock the Parse RESTController
})

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
      expect(parsm.getMkStOpts()).toEqual({})
    })
    it('returns empty object when first or both params are falsy', () => {
      expect(parsm.getMkStOpts(false)).toEqual({})
      expect(parsm.getMkStOpts(null)).toEqual({})
      expect(parsm.getMkStOpts(false,null)).toEqual({})
      expect(parsm.getMkStOpts(null,null)).toEqual({})
    })
    it('returns {userMasterKey: true}', () => {
      const umk = {useMasterKey: true}
      expect(parsm.getMkStOpts(true)).toEqual(umk)
      expect(parsm.getMkStOpts(true, 'abc')).toEqual(umk)
    })
    it(`returns {sessionToken: <string>}`, () => {
      const st = {sessionToken: 'abc'}
      expect(parsm.getMkStOpts(null, 'abc')).toEqual(st)
      expect(parsm.getMkStOpts(false, 'abc')).toEqual(st)
      expect(parsm.getMkStOpts(false, 'def')).not.toEqual(st)
    })
  })
  
  describe('newQuery', () => {
    test('returns a query that finds all instances of a Parse class', () => {
      expect.assertions(15)
      return Parse.Promise.when([
        parsm.newQuery('Bouquet', {skip: 5}).find()
      ])
        .then(([allBouquets, firstFive, lastFive]) => {
          expect(allBouquets).toHaveLength(savedBouquets.length)
          expect(parsm.isPFObject(allBouquets[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(allBouquets[9], 'Bouquet')).toBe(true)
          expect(allBouquets[0].id).toBe('1')
          expect(allBouquets[9].id).toBe('10')
          expect(firstFive).toHaveLength(5)
          expect(parsm.isPFObject(firstFive[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(firstFive[4], 'Bouquet')).toBe(true)
          expect(firstFive[0].id).toBe('1')
          expect(firstFive[4].id).toBe('5')
          expect(lastFive).toHaveLength(5)
          expect(parsm.isPFObject(lastFive[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(lastFive[4], 'Bouquet')).toBe(true)
          expect(lastFive[0].id).toBe(savedBouquets[5].id)
          expect(lastFive[4].id).toBe(savedBouquets[9].id)
        })
      })
  })
  
  describe('getObjById', () => {
    it('gets a Parse object from db by id', () => {
      expect.assertions(2)
      const aParseObj = new TheParseObj()
      let newObjId
      return aParseObj
        .save({roses:'red'})
        .then(savedObj => {
          newObjId = savedObj.id
          return parsm.getObjById('TheParseObj', newObjId)
        })
        .then(retrievedObj => {
          expect(parsm.isPFObject(retrievedObj)).toBe(true)
          expect(retrievedObj.id).toBe(newObjId)
        })
    })
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
    it('determines if a variable is a Parse.Object of a certain class', () => {
      expect(parsm.isPFObject(aParseObj, 'TheParseObj')).toBe(true)
    })
    it('ignores invalid "ofClass" parameter', () => {
      expect(parsm.isPFObject(aParseObj, 3)).toBe(true)
    })
  })
  
})
