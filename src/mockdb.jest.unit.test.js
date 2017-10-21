'use strict'

import Parse from 'parse/node'
import ParseMockDB from 'parse-mockdb'


Parse.initialize('test')

describe('parse-mockdb testing', () => {
  
  test('should save correctly', () => {
    expect.assertions(1)
    ParseMockDB.mockDB(); // Mock the Parse RESTController
    let
      TheObj = Parse.Object.extend('TheParseObj'),
      obj = new TheObj()
    return obj.save({message:'hello'})
      .then(obj => {
        expect(obj.get('message')).toBeDefined()
        ParseMockDB.cleanUp(); // Clear the Database
        ParseMockDB.unMockDB(); // Un-mock the Parse RESTController
      })
  })
})
