import {expect} from 'chai'
import Parse from 'Parse'
import utils from './index'

describe('utils.objPick', ()=>{
  it('gets some columns from a Parse object and returns them in a js object', ()=>{
    const parseObj = new Parse.Object('Colors')
    parseObj.set('roses', 'red')
    parseObj.set('violets', 'blue')
    parseObj.set('grass', 'green')
    expect(utils.objPick(parseObj, 'roses,grass')).to.eql({roses:'red', grass:'green'})
    expect(utils.objPick(parseObj, ['roses', 'grass'])).to.eql({roses:'red', grass:'green'})
  })
  it('sets some columns on a Parse object from a js object', ()=>{
    const parseObj = new Parse.Object('Colors')
    parseObj.set('roses', 'red')
    parseObj.set('violets', 'blue')
    parseObj.set('grass', 'green')
    utils.objSetMulti(parseObj, {valley:'big', river:'deep'})
    expect(parseObj.get('river')).to.equal('deep')
  })
})
