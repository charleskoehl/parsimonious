import { expect } from 'chai'
import Parse from 'Parse'
import parsimonious from '../src/index'

const Colors = Parse.Object.extend('Colors')
const colors = new Colors()

describe('parsimonious.toJsn()', () => {
  it('returns JSON representation of a Parse object', () => {
    colors.set('roses', 'red')
    colors.set('violets', 'blue')
    colors.set('grass', 'green')
    expect(parsimonious.toJsn(colors)).to.eql({roses: 'red', violets: 'blue', grass: 'green'})
  })
})

describe('parsimonious.objPick()', () => {
  it('gets some columns from a Parse object and returns them in a js object', () => {
    expect(parsimonious.objPick(colors, 'roses,grass')).to.eql({roses: 'red', grass: 'green'})
    expect(parsimonious.objPick(colors, ['roses', 'grass'])).to.eql({roses: 'red', grass: 'green'})
  })
})

describe('parsimonious.objSetMulti()', () => {
  it('sets some columns on a Parse object from a js object', () => {
    parsimonious.objSetMulti(colors, {valley: 'big', river: 'deep'})
    expect(colors.get('river')).to.equal('deep')
  })
})

describe('parsimonious.newQuery()', () => {
  const query = parsimonious.newQuery('Colors')
  it('generates a new Parse.Query given a Parse Object class name', () => {
    expect(typeof query === 'object' && query.className === 'Colors' && typeof query.find === 'function').to.be.true
  })
})

describe('parsimonious.isPFObject()', () => {
  it('determines if a variable is a Parse.Object', () => {
    expect(parsimonious.isPFObject(colors)).to.be.true
  })
})