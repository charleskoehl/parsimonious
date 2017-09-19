import Parse from 'Parse'
import parsm from './index'

const Colors = Parse.Object.extend('Colors')
const colors = new Colors()

describe('parsimonious methods', () => {
  
  describe('toJsn()', () => {
    colors.set('roses', 'red')
    colors.set('violets', 'blue')
    colors.set('grass', 'green')
    it('returns a shallow JSON representation of a Parse object', () => {
      expect(parsm.toJsn(colors)).toEqual({
        roses: 'red',
        violets: 'blue',
        grass: 'green'
      })
    })
    it('returns deep JSON representation of a plain object containing a Parse object', () => {
      const plainObj = {
        foo: 'bar', 
        domo: 'arigato', 
        things: ['cow', 'pencil'], 
        colors
      }
      expect(parsm.toJsn(plainObj, true)).toEqual({
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        colors: {
          roses: 'red', 
          violets: 'blue', 
          grass: 'green'
        }
      })
    })
  })
  
  describe('objPick()', () => {
    it('gets some columns from a Parse object and returns them in a plain object', () => {
      expect(parsm.objPick(colors, 'roses,grass')).toEqual({
        roses: 'red',
        grass: 'green'
      })
      expect(parsm.objPick(colors, ['roses', 'grass'])).toEqual({
        roses: 'red',
        grass: 'green'
      })
    })
  })
  
  describe('objSetMulti()', () => {
    it('sets some columns on a Parse object from a js object', () => {
      parsm.objSetMulti(colors, {
        valley: 'big',
        river: 'deep'
      })
      expect(colors.get('river')).toBe('deep')
    })
  })
  
  describe('newQuery()', () => {
    const query = parsm.newQuery('Colors')
    it('returns a new Parse.Query given a Parse Object class name', () => {
      expect(typeof query === 'object' && query.className === 'Colors' && typeof query.find === 'function').toBe(true)
    })
  })
  
  describe('getClassInst()', () => {
    const inst = parsm.getClassInst('Colors')
    it('returns a subclass of Parse.Object given class name', () => {
      expect(inst.className === 'Colors').toBe(true)
    })
  })
  
  describe('isPFObject()', () => {
    it('determines if a variable is a Parse.Object', () => {
      expect(parsm.isPFObject(colors)).toBe(true)
    })
  })
})