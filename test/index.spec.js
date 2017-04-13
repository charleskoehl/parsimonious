import { expect } from 'chai'
import Parse from 'Parse'
import parsimonious from '../src/index'

describe('parsimonious.objPick()', () => {
  it('gets some columns from a Parse object and returns them in a js object', () => {
    const parseObj = new Parse.Object('Colors')
    parseObj.set('roses', 'red')
    parseObj.set('violets', 'blue')
    parseObj.set('grass', 'green')
    expect(parsimonious.objPick(parseObj, 'roses,grass')).to.eql({roses: 'red', grass: 'green'})
    expect(parsimonious.objPick(parseObj, ['roses', 'grass'])).to.eql({roses: 'red', grass: 'green'})
  })
})

describe('parsimonious.objSetMulti()', () => {
  it('sets some columns on a Parse object from a js object', () => {
    const parseObj = new Parse.Object('Colors')
    parseObj.set('roses', 'red')
    parseObj.set('violets', 'blue')
    parseObj.set('grass', 'green')
    parsimonious.objSetMulti(parseObj, {valley: 'big', river: 'deep'})
    expect(parseObj.get('river')).to.equal('deep')
  })
})
