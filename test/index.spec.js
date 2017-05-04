import { expect } from 'chai'
import Parse from 'Parse'
import parsimonious from '../src/index'

const Colors = Parse.Object.extend('Colors')
const colors = new Colors()

describe('parsimonious methods', () => {
  
  describe('toJsn()', () => {
    colors.set('roses', 'red')
    colors.set('violets', 'blue')
    colors.set('grass', 'green')
    it('returns a shallow JSON representation of a Parse object', () => {
      expect(parsimonious.toJsn(colors)).to.eql({roses: 'red', violets: 'blue', grass: 'green'})
    })
    it('returns deep JSON representation of a plain object containing a Parse object', () => {
      const plainObj = {foo:'bar',domo:'arigato',things:['cow','pencil'], colors}
      expect(parsimonious.toJsn(plainObj, true)).to.eql({foo:'bar',domo:'arigato',things:['cow','pencil'], colors: {roses: 'red', violets: 'blue', grass: 'green'}})
    })
  })
  
  describe('objPick()', () => {
    it('gets some columns from a Parse object and returns them in a plain object', () => {
      expect(parsimonious.objPick(colors, 'roses,grass')).to.eql({roses: 'red', grass: 'green'})
      expect(parsimonious.objPick(colors, ['roses', 'grass'])).to.eql({roses: 'red', grass: 'green'})
    })
  })
  
  describe('objSetMulti()', () => {
    it('sets some columns on a Parse object from a js object', () => {
      parsimonious.objSetMulti(colors, {valley: 'big', river: 'deep'})
      expect(colors.get('river')).to.equal('deep')
    })
  })
  
  describe('newQuery()', () => {
    const query = parsimonious.newQuery('Colors')
    it('returns a new Parse.Query given a Parse Object class name', () => {
      expect(typeof query === 'object' && query.className === 'Colors' && typeof query.find === 'function').to.be.true
    })
  })
  
  describe('getClassInst()', () => {
    const inst = parsimonious.getClassInst('Colors')
    it('returns a subclass of Parse.Object given class name', () => {
      expect(inst.className === 'Colors').to.be.true
    })
  })
  
  describe('isPFObject()', () => {
    it('determines if a variable is a Parse.Object', () => {
      expect(parsimonious.isPFObject(colors)).to.be.true
    })
  })
})