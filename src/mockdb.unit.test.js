'use strict'

import Parse from 'parse/node'
import ParseMockDB from 'parse-mockdb'


Parse.initialize('test')

describe('parse-mockdb testing', () => {
  
  it('should save correctly', () => {
    ParseMockDB.mockDB(); // Mock the Parse RESTController
    let
      TheObj = Parse.Object.extend('TheParseObj'),
      obj = new TheObj()
    obj.save({message:'hello'})
      .then(obj => {
        assert.equal(obj.get('message'), 'hello');
        ParseMockDB.cleanUp(); // Clear the Database
        ParseMockDB.unMockDB(); // Un-mock the Parse RESTController
      })
  }
  )
})
