'use strict'

import Parse from 'parse/node'
import {ParseServer} from 'parse-server'
import parsm from '../src/index'
import express from 'express'
import http from 'http'
import MongodbMemoryServer from 'mongodb-memory-server'

const TheParseObj = Parse.Object.extend('TheParseObj')
const Bouquet = Parse.Object.extend('Bouquet')
let unsavedParseObj, savedBouquets, testUser

const setTestObjects = async () => {
  // Destroy old test objects in case any were saved:
  let oldTheObjs, oldBouquets, oldUser, deleted
  oldTheObjs = await parsm.newQuery('TheParseObj').find()
  oldBouquets = await parsm.newQuery('Bouquet').find()
  oldUser = await parsm.newQuery('User', {
    equalTo: ['username', 'foomanchoo']
  }).first({useMasterKey: true})
  const toDelete = [...oldTheObjs, ...oldBouquets]
  if(oldUser) {
    toDelete.push(oldUser)
  }
  deleted = await Parse.Object.destroyAll(toDelete, {useMasterKey: true})
  // Create fresh new objects:
  unsavedParseObj = new TheParseObj({
    roses: 'red',
    violets: 'blue',
    grass: 'green'
  })
  savedBouquets = await Parse.Promise.when(Array.from(Array(10).keys()).map(n => parsm.getClassInst('Bouquet').save({active: false, aNum: n})))
  testUser = new Parse.User({
    username: 'foomanchoo',
    password: 'je9w83d',
    name: 'Foo Manchoo',
    email: 'foo@manchoo.com'
  })
  testUser = await testUser.signUp()
}

/**
 * Return true if the ID of the object at foundIndex in foundBouquets
 * matches the id of the object at savedIndex in savedBouquets.
 *
 * @param {array} foundBouquets
 * @param {number} foundIndex
 * @param {number} savedIndex
 */
const sameBouquets = (foundBouquets, foundIndex, savedIndex) => {
  foundBouquets.sort((a, b) => {
    const aNum = a.get('aNum')
    const bNum = b.get('aNum')
    if(aNum < bNum) {
      return -1
    } else if(aNum > bNum) {
      return 1
    } else {
      return 0
    }
  })
  const foundBouquet = foundBouquets[foundIndex]
  return parsm.isPFObject(foundBouquet) && foundBouquet.id == savedBouquets[savedIndex].id
}

let mongod, parseServer

beforeAll(() => {
  const appId = 'parsimonious-test-server'
  const host = '127.0.0.1'
  const masterKey = 'abc123'
  mongod = new MongodbMemoryServer()
  return new Parse.Promise((resolve, reject) => {
    Promise.all([require('new-port'), mongod.getConnectionString(), mongod.getPort()])
      .then(([httpPort, dbUri, dbPort]) => {
        console.log(`\nMongodbMemoryServer started at ${dbUri}, port ${dbPort}`)
        const parseMount = '/parse'
        const serverURL = `http://${host}:${httpPort}${parseMount}`
        const parseConfig = {
          appId,
          appName: 'Parsimonious Test Server',
          masterKey,
          serverURL,
          databaseURI: dbUri,
          publicServerURL: serverURL,
          preventLoginWithUnverifiedEmail: false,
          enableSingleSchemaCache: true, // without this option, the _schema is called upon every request
        }
        const app = express()
        const api = new ParseServer(parseConfig)
        app.use(parseMount, api)
        try {
          parseServer = require('http-shutdown')(http.createServer(app)) // adds graceful 'shutdown' method
          parseServer.listen(httpPort, host, () => {
            console.log(`\nParse server running on port ${httpPort}`)
            try {
              Parse.initialize(appId, null, masterKey)
              Parse.serverURL = serverURL
              parsm.setParse(Parse)
              resolve()
            } catch(e) {
              reject('Could not initialize Parse or Parsimonious:', e)
            }
          })
        } catch(err) {
          console.error(err)
          reject(`\ncould not create http server`)
        }
      })
  })
})

afterAll(() => {
  console.log('shutting down test environment')
  return new Parse.Promise((resolve, reject) => {
    parseServer.shutdown(() => {
      console.log('app server has shut down gracefully')
      mongod.stop()
      console.log('MongodbMemoryServer stopped')
      resolve()
    })
      .catch(reject)
  })
})

describe('setParse', () => {
  
  test('sets a valid instance of Parse to use', () => {
    expect(() => parsm.setParse(Parse)).not.toThrow()
  })
  
  test('throws TypeError when invalid instance of Parse is passed', () => {
    expect(() => parsm.setParse('blah')).toThrow()
  })
  
})

describe('toJsn', () => {
  
  beforeAll(setTestObjects)
  
  test('returns the passed value when it is not a Parse object or a plain, non-null object', () => {
    const mySymbol = Symbol('test')
    expect(parsm.toJsn(mySymbol)).toBe(mySymbol)
    expect(parsm.toJsn()).toBe()
    expect(parsm.toJsn(undefined)).toBe(undefined)
    expect(parsm.toJsn(null)).toBe(null)
    expect(parsm.toJsn(true)).toBe(true)
    expect(parsm.toJsn(2)).toBe(2)
    expect(parsm.toJsn('abc')).toBe('abc')
  })
  test('returns a shallow JSON representation of a Parse object', () => {
    expect(parsm.toJsn(unsavedParseObj)).toEqual({
      roses: 'red',
      violets: 'blue',
      grass: 'green'
    })
  })
  test('returns deep JSON representation of a plain object containing a plain, non-Parse object', () => {
    const plainObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      doohicky: {
        springs: 5,
        levers: 2
      }
    }
    expect(parsm.toJsn(plainObj, true)).toEqual({
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      doohicky: {
        springs: 5,
        levers: 2
      }
    })
  })
  test('returns deep JSON representation of a plain object containing a Parse object', () => {
    const someObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: unsavedParseObj
    }
    expect(parsm.toJsn(someObj, true)).toEqual({
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
  test('returns deep JSON representation of a plain object containing a Parse object that has an objectId key', () => {
    unsavedParseObj.set('objectId', 'iei38s')
    const someObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: unsavedParseObj
    }
    expect(parsm.toJsn(someObj, true)).toEqual({
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
  
  const
    TheParseObj = Parse.Object.extend('TheParseObj'),
    unsavedParseObj = new TheParseObj({
      roses: 'red',
      violets: 'blue',
      grass: 'green'
    })
  
  test('gets some columns from a Parse object and returns them in a plain object', () => {
    expect(parsm.objPick(unsavedParseObj, 'roses,grass')).toMatchObject({
      roses: 'red',
      grass: 'green'
    })
    expect(parsm.objPick(unsavedParseObj, ['roses', 'grass'])).toMatchObject({
      roses: 'red',
      grass: 'green'
    })
  })
  
})

describe('objGetDeep', () => {
  
  test('Get the value of a key nested within a plain object contained in a column of a Parse.Object.', () => {
    const someObj = parsm.getClassInst('Company', {
      depts: {
        accounting: {
          employees: [
            {
              name: 'fred',
              height: 6.1
            }, {
              name: 'dan',
              height: 5.6
            }
          ]
        },
        marketing: {
          employees: [
            {
              name: 'joe',
              height: 6.1
            }, {
              name: 'jane',
              height: 5.6
            }
          ]
        }
      }
    })
    expect(someObj.get('depts')).toBeInstanceOf(Object)
    expect(someObj.get('depts').accounting.employees[0].name).toBe('fred')
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees[0].name')).toBe('fred')
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees')).toHaveLength(2)
  })
  
  test('Get the value of a key nested within a Parse.Object contained in a column of a parent Parse.Object.', () => {
    expect.assertions(4)
    const address = parsm.getClassInst('Address', {
      line1: '123 Main Street',
      line2: 'Suite 30',
      city: 'Boston',
      state: 'MA',
      zip: '02110'
    })
    return address.save()
      .then(addr => {
        const company = parsm.getClassInst('Company', {
          name: 'IBM',
          address: addr
        })
        return company.save()
      })
      .then(co => {
        expect(co.className).toBe('Company')
        const addr = co.get('address')
        expect(addr.className).toBe('Address')
        expect(addr.get('city')).toBe('Boston')
        expect(parsm.objGetDeep(co, 'address.city')).toBe('Boston')
      })
  })
  
})

describe('objSetMulti', () => {
  
  beforeAll(setTestObjects)
  
  test('sets some columns on a Parse object from a plain object', () => {
    parsm.objSetMulti(unsavedParseObj, {
      valley: 'big',
      river: 'deep'
    })
    expect(unsavedParseObj.get('river')).toBe('deep')
  })
  
  test('sets some columns on a Parse object from a plain object, not merging sub-objects', () => {
    unsavedParseObj.set('ocean', {
      size: 'large',
      color: 'blue',
      denizens: 'fish'
    })
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size: 'medium',
        color: 'green'
      }
    })
    expect(unsavedParseObj.get('ocean')).toEqual({
      size: 'medium',
      color: 'green'
    })
  })
  
  test('sets some columns on a Parse.Oobject from a plain object, merging sub-objects', () => {
    unsavedParseObj.set('ocean', {
      size: 'large',
      color: 'blue',
      denizens: 'fish'
    })
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size: 'medium',
        color: 'green'
      }
    }, true)
    expect(unsavedParseObj.get('ocean')).toEqual({
      size: 'medium',
      color: 'green',
      denizens: 'fish'
    })
  })
  
})

describe('sortPFObjectsByKey', () => {
  
  test('throws on invalid array param', () => {
    expect(() => sortPFObjectsByKey()).toThrow()
    expect(() => sortPFObjectsByKey('blah')).toThrow()
    expect(() => sortPFObjectsByKey([])).toThrow()
    expect(() => sortPFObjectsByKey(['blah'])).toThrow()
  })
  
  test('sorts an array of Parse.Object', () => {
    const objs = ['a', 'c', 'b', 'd', 'b'].map(name => parsm.getClassInst('TheParseObj', {name}))
    expect(objs[3].get('name')).toBe('d')
    expect(objs[4].get('name')).toBe('b')
    parsm.sortPFObjectsByKey(objs, 'name')
    expect(objs[0].get('name')).toBe('a')
    expect(objs[1].get('name')).toBe('b')
    expect(objs[2].get('name')).toBe('b')
    expect(objs[3].get('name')).toBe('c')
    expect(objs[4].get('name')).toBe('d')
  })
  
})

describe('newQuery', () => {
  
  beforeAll(setTestObjects)
  
  test('returns a query that finds all instances of a Parse class when passed a custom Parse class name', () => {
    expect.assertions(3)
    return parsm.newQuery('Bouquet', {ascending: 'aNum'}).find()
      .then(objs => {
        expect(objs).toHaveLength(savedBouquets.length)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 9, 9)).toBe(true)
      })
  })
  
  test('returns a query that finds all instances of a Parse class when passed a custom Parse class instance', () => {
    expect.assertions(3)
    return parsm.newQuery(new Bouquet(), {ascending: 'aNum'}).find()
      .then(objs => {
        expect(objs).toHaveLength(savedBouquets.length)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 9, 9)).toBe(true)
      })
  })
  
  test('returns a query limited to first n instances of a Parse class', () => {
    expect.assertions(3)
    return parsm.newQuery('Bouquet', {ascending: 'aNum', limit: 5}).find()
      .then(objs => {
        expect(objs).toHaveLength(5)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 4, 4)).toBe(true)
      })
  })
  test('returns a query skipping first n instances of a Parse class', () => {
    expect.assertions(3)
    return parsm.newQuery('Bouquet', {ascending: 'aNum', skip: 5}).find()
      .then(objs => {
        expect(objs).toHaveLength(5)
        expect(sameBouquets(objs, 0, 5)).toBe(true)
        expect(sameBouquets(objs, 4, 9)).toBe(true)
      })
  })
  test('returns a query that selects only a certain column to be returned', () => {
    expect.assertions(5)
    return parsm.newQuery('Bouquet', {
      ascending: 'aNum',
      select: 'aNum'
    }).find()
      .then(objs => {
        expect(objs).toHaveLength(10)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 9, 9)).toBe(true)
        expect(objs[6].get('aNum')).toBe(6)
        expect(objs[6].get('active')).toBeUndefined()
      })
  })
  
  test('returns a query that finds all instances of a special Parse class when passed the class name', () => {
    expect.assertions(2)
    return parsm.newQuery('User').find()
      .then(objs => {
        expect(objs).toHaveLength(1)
        expect(objs[0].get('username')).toBe('foomanchoo')
      })
  })
  
  test('returns a query that finds all instances of a special Parse class when passed a class instance', () => {
    expect.assertions(2)
    const inst = new Parse.User()
    return parsm.newQuery(inst).find()
      .then(objs => {
        expect(objs).toHaveLength(1)
        expect(objs[0].get('username')).toBe('foomanchoo')
      })
  })
  
  test('returns a query that calls Parse.Query.include on two pointer columns to retrieve the entire targets of the pointers', () => {
    expect.assertions(10)
    const car = parsm.getClassInst('Car', {
      class: 'economy',
      seats: 50
    })
    const engine = parsm.getClassInst('Engine', {
      horsepower: 3000
    })
    const train = parsm.getClassInst('Train')
    return Parse.Object.saveAll([car, engine])
      .then(([newCar, newEngine]) => {
        expect(typeof newCar.id).toBe('string')
        expect(typeof newEngine.id).toBe('string')
        return train.save({
          color: 'white',
          cars: 17,
          speed: 150,
          car: newCar,
          engine: newEngine
        })
          .then(newTrain => {
            const car = newTrain.get('car')
            const engine = newTrain.get('engine')
            expect(car).toBeInstanceOf(Object)
            expect(car.get('seats')).toBe(50)
            expect(engine).toBeInstanceOf(Object)
            expect(engine.get('horsepower')).toBe(3000)
            const query = parsm.newQuery('Train')
            query.include(['engine', 'car'])
            return query.first()
          })
          .then(trainWithIncludes => {
            const car = trainWithIncludes.get('car')
            const engine = trainWithIncludes.get('engine')
            expect(car).toBeInstanceOf(Object)
            expect(car.get('seats')).toBe(50)
            expect(engine).toBeInstanceOf(Object)
            expect(engine.get('horsepower')).toBe(3000)
          })
      })
    
  })
  
})

describe('constrainQuery', () => {
  
  beforeAll(setTestObjects)
  
  test('constrains a query with "limit"', () => {
    expect.assertions(3)
    const query = parsm.newQuery('Bouquet')
    parsm.constrainQuery(query, {limit: 5})
    return query.find()
      .then(objs => {
        expect(objs).toHaveLength(5)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 4, 4)).toBe(true)
      })
  })
  test('throws TypeError when params are invalid', () => {
    expect(parsm.constrainQuery).toThrow(TypeError)
    expect(() => parsm.constrainQuery('blah')).toThrow(TypeError)
    expect(() => parsm.constrainQuery('blah', 'blah')).toThrow(TypeError)
  })
  test('throws RangeError when one or more constraints are not valid methods of Parse.Query', () => {
    const query = parsm.newQuery('Bouquet')
    expect(() => parsm.constrainQuery(query, {blah: [3, 4, 5]})).toThrow(RangeError)
  })
  test('throws Error when calling a valid constraint method on a valid query throws an error', () => {
    const query = parsm.newQuery('Bouquet')
    expect(() => parsm.constrainQuery(query, {limit: 'blah'})).toThrow(Error)
  })
  test('constrains a query with "skip"', () => {
    expect.assertions(5)
    const query = parsm.newQuery('Bouquet')
    parsm.constrainQuery(query, {skip: 5})
    return query.find()
      .then(objs => {
        expect(objs).toHaveLength(5)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).toBe(true)
        expect(parsm.isPFObject(objs[4], 'Bouquet')).toBe(true)
        expect(sameBouquets(objs, 0, 5)).toBe(true)
        expect(sameBouquets(objs, 4, 9)).toBe(true)
      })
  })
  test('constrains a query with "select"', () => {
    expect.assertions(7)
    const query = parsm.newQuery('Bouquet')
    parsm.constrainQuery(query, {select: [['aNum']]})
    return query.find()
      .then(objs => {
        expect(objs).toHaveLength(10)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).toBe(true)
        expect(parsm.isPFObject(objs[9], 'Bouquet')).toBe(true)
        expect(sameBouquets(objs, 0, 0)).toBe(true)
        expect(sameBouquets(objs, 9, 9)).toBe(true)
        expect(objs[6].get('aNum')).toBe(6)
        expect(objs[6].get('active')).toBeUndefined()
      })
  })
  test('constrains a query with multiple constraints', () => {
    expect.assertions(19)
    // Generate 10 new objects:
    const car = parsm.getClassInst('Car', {
      class: 'economy',
      seats: 50
    })
    const engine = parsm.getClassInst('Engine', {
      horsepower: 3000
    })
    const trainInfo = [
      {name: 'A', speed: 100},
      {name: 'B', speed: 200},
      {name: 'C', speed: 300},
      {name: 'D', speed: 400},
      {name: 'E', speed: 500},
      {name: 'F', speed: 600},
      {name: 'G', speed: 700},
      {name: 'H', speed: 800},
      {name: 'I', speed: 900},
      {name: 'J', speed: 1000}
    ]
    const trains = trainInfo.map(info => parsm.getClassInst('Train', {car, engine, ...info}))
    return Parse.Object.saveAll(trains)
      .then(savedTrains => {
        expect(savedTrains).toBeInstanceOf(Array)
        expect(savedTrains.length).toBe(10)
        expect(savedTrains[9].get('name')).toBe('J')
        const query = parsm.newQuery('Train')
        parsm.constrainQuery(query, {
          ascending: 'name',
          include: 'car',
          greaterThan: ['speed', 300],
          lessThan: ['speed', 800]
        })
        return query.find()
      })
      .then(someTrains => {
        expect(someTrains).toBeInstanceOf(Array)
        expect(someTrains.length).toBe(4)
        expect(someTrains[1].get('name')).toBe('E')
        expect(someTrains[2].get('speed')).toBe(600)
        expect(someTrains[2].get('car')).toBeInstanceOf(Object)
        expect(someTrains[2].get('car').get('seats')).toBe(50)
        expect(someTrains[2].get('engine')).toBeInstanceOf(Object)
        expect(someTrains[2].get('engine').get('horsepower')).toBeUndefined()
        const query = parsm.newQuery('Train')
        parsm.constrainQuery(query, {
          ascending: 'name',
          include: [['car', 'engine']], // an array arg of a constraint must be nested in another array so that its items are not treated as separate args of the constraint
          greaterThan: ['speed', 300],
          lessThan: ['speed', 800]
        })
        return query.find()
      })
      .then(someTrains => {
        expect(someTrains).toBeInstanceOf(Array)
        expect(someTrains.length).toBe(4)
        expect(someTrains[1].get('name')).toBe('E')
        expect(someTrains[2].get('speed')).toBe(600)
        expect(someTrains[2].get('car')).toBeInstanceOf(Object)
        expect(someTrains[2].get('car').get('seats')).toBe(50)
        expect(someTrains[2].get('engine')).toBeInstanceOf(Object)
        expect(someTrains[2].get('engine').get('horsepower')).toBe(3000)
      })
  })
  
})

describe('getId', () => {
  
  test('returns same string', () => {
    expect(parsm.getId('abc123')).toMatch('abc123')
  })
  
  test('returns id of Parse.Object', () => {
    expect(parsm.getId(testUser)).toBe(testUser.id)
  })
  
  test('returns id of Parse.Object pointer', () => {
    expect(parsm.getId(testUser.toPointer())).toBe(testUser.id)
  })
  
})

describe('getObjById', () => {
  test('gets a Parse object from server by id', () => {
    expect.assertions(2)
    const aParseObj = new TheParseObj()
    let newObjId
    return aParseObj
      .save({roses: 'red'})
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
  
  beforeAll(setTestObjects)
  
  test('gets a Parse user by id', () => {
    expect.assertions(2)
    return parsm.getUserById(testUser.id)
      .then(aUser => {
        expect(aUser.createdAt).toEqual(testUser.createdAt)
        expect(parsm.isPFObject(aUser, 'User')).toBe(true)
      })
  })
})

describe('getPFObject', () => {
  
  beforeAll(setTestObjects)
  
  test('resolves as the first parameter unchanged if it\'s a Parse.Object', () => {
    return expect(parsm.getPFObject(savedBouquets[0])).resolves.toBe(savedBouquets[0])
  })
  
  test('resolves as the first parameter unchanged if it\'s a Parse.Object of a certain class', () => {
    return expect(parsm.getPFObject(savedBouquets[0], 'Bouquet')).resolves.toBe(savedBouquets[0])
  })
  
  test('resolves as undefined if it\'s a Parse.Object of the wrong class', () => {
    return expect(parsm.getPFObject(testUser, 'Bouquet')).resolves.toBeUndefined()
  })
  
  test('if first parameter is a pointer, resolves as the Parse.Object from the server', () => {
    expect.assertions(1)
    return parsm.getPFObject(savedBouquets[0].toPointer())
      .then(obj => {
        expect(parsm.isPFObject(obj, 'Bouquet')).toBe(true)
      })
  })
  
})

describe('isArrayOfPFObjects', () => {
  
  test('returns false if not an array', () => {
    expect(parsm.isArrayOfPFObjects('hey')).resolves.toBe(false)
  })
  
  test('returns false if array with no Parse.Object\'s', () => {
    expect(parsm.isArrayOfPFObjects(['hey', 'there'])).resolves.toBe(false)
  })
  
  test('returns false if one or more items of array are not Parse.Object\'s', () => {
    const corruptArray = savedBouquets.slice(0).push('hey')
    expect(parsm.isArrayOfPFObjects(corruptArray)).resolves.toBe(false)
  })
  
  test('returns true if all items of array are Parse.Objects', () => {
    expect(parsm.isArrayOfPFObjects(savedBouquets)).resolves.toBe(true)
  })
  
})

describe('fetchIfNeeded, given a value <thing>, return a promise that resolves to', () => {
  
  beforeAll(setTestObjects)
  
  test('thing if thing is a clean Parse.Object', () => {
    expect.assertions(1)
    return parsm.fetchIfNeeded(savedBouquets[0])
      .then(result => {
        expect(result).toBe(savedBouquets[0])
      })
  })
  test('fetched Parse.Object if thing is a dirty Parse.Object', () => {
    expect.assertions(1)
    savedBouquets[0].set('active', true)
    return parsm.fetchIfNeeded(savedBouquets[0])
      .then(result => {
        expect(result.get('active')).toBe(false)
      })
  })
  test('fetched Parse.Object if thing is a pointer', () => {
    expect.assertions(3)
    return parsm.fetchIfNeeded(savedBouquets[0].toPointer())
      .then(result => {
        expect(result).toBeTruthy()
        expect(parsm.isPFObject(result)).toBe(true)
        expect(parsm.isPFObject(result, 'Bouquet')).toBe(true)
      })
  })
  test('thing if otherwise', () => {
    return expect(parsm.fetchIfNeeded('blah')).resolves.toEqual('blah')
  })
})

describe('Roles', () => {
  
  let adminRole, modRole
  
  beforeAll(() => {
    return setTestObjects()
      .then(() => {
        const roleACL = new Parse.ACL()
        roleACL.setPublicReadAccess(true)
        roleACL.setPublicWriteAccess(true)
        adminRole = new Parse.Role('Administrator', roleACL)
        modRole = new Parse.Role('Moderator', roleACL)
      })
  })
  
  describe('userHasRole', () => {
    
    test('determines if a user has a single role', () => {
      expect.assertions(5)
      return parsm.userHasRole(testUser, 'Administrator')
        .then(hasRole => {
          expect(hasRole).toBe(false)
          return adminRole.getUsers()
            .add(testUser)
            .save()
            .then(() => parsm.userHasRole(testUser, 'Administrator'))
        })
        .then(hasRole => {
          expect(hasRole).toBe(true)
          return parsm.userHasRole(testUser, {
            names: ['Administrator', 'Moderator'],
            op: 'or'
          })
        })
        .then(hasRoles => {
          expect(hasRoles).toBe(true)
          return modRole.getUsers()
            .add(testUser)
            .save()
            .then(() => parsm.userHasRole(testUser, {
              names: ['Administrator', 'Moderator'],
              op: 'and'
            }))
        })
        .then(hasRoles => {
          expect(hasRoles).toBe(true)
          return parsm.userHasRole(testUser, {
            names: ['Administrator', 'Moderator'],
            op: 'or'
          })
        })
        .then(hasRoles => {
          expect(hasRoles).toBe(true)
        })
    })
    
    test('reject when invalid "user" param', () => {
      return expect(parsm.userHasRole()).rejects.toBe('invalid user')
    })
    test('reject when invalid "roles" param', () => {
      return expect(parsm.userHasRole(testUser)).rejects.toBe('invalid roles')
    })
  })
  
  describe('getRole', () => {
    test('returns Role object by name', () => {
      expect.assertions(1)
      return parsm.getRole('Administrator')
        .then(role => {
          expect(parsm.isPFObject(role, 'Role')).toBe(true)
        })
    })
  })
  
  describe('getUserRoles', () => {
    test('returns array of names of user\'s direct roles, or empty array if none', () => {
      expect.assertions(4)
      const user = new Parse.User({
        username: 'blastois',
        password: 'je9w83d',
        email: 'blast@ois.com'
      })
      return user.save()
        .then(aUser => {
          return parsm.getUserRoles(aUser)
            .then(roles => {
              expect(Array.isArray(roles)).toBe(true)
              expect(roles).toHaveLength(0)
              adminRole.getUsers().add(aUser)
              return adminRole.save()
            })
            .then(() => parsm.getUserRoles(aUser))
            .then(roles => {
              expect(roles.length).toBe(1)
              expect(roles[0]).toBe('Administrator')
            })
        })
    })
  })
  
})

describe('getClass', () => {
  test('returns a subclass of Parse.Object', () => {
    const cls = parsm.getClass('Colors')
    expect(typeof cls).toBe('function')
    expect(cls.className === 'Colors').toBe(true)
  })
  test('throws an error if passed non-string', () => {
    expect(() => parsm.getClass(2)).toThrow()
  })
})

describe('getClassInst', () => {
  test('returns an instance of a subclass of Parse.Object', () => {
    const inst = parsm.getClassInst('Colors')
    expect(typeof inst).toBe('object')
    expect(inst.className === 'Colors').toBe(true)
  })
  test('returns a subclass of Parse.Object with some attributes set', () => {
    const inst = parsm.getClassInst('Birds', {
      raven: {
        color: 'black'
      },
      dove: {
        color: 'white'
      }
    })
    expect(typeof inst).toBe('object')
    expect(inst.className === 'Birds').toBe(true)
    expect(inst.get('raven').color).toBe('black')
    expect(inst.get('dove').color).toBe('white')
  })
  test('returns an instance of a special Parse.Object class', () => {
    const newUser = parsm.getClassInst('User')
    expect(newUser instanceof Parse.User).toBe(true)
  })
})

describe('Relationships', () => {
  
  describe('Many-to-Many with Join Tables', () => {
    
    describe('getJoinTableName', () => {
      test(`returns a name for a table used to join two other tables; format: <first table name>2<second table name>`, () => {
        expect(parsm.getJoinTableName('Employee', 'Company')).toBe('Employee2Company')
      })
    })
    
    describe('joinWithTable', () => {
      
      describe('when called with deprecated parameter types', () => {
        
        let Ship, Fleet, Destroyer
        
        beforeAll(async (done) => {
          Ship = await parsm.getClassInst('Ship').save()
          Fleet = await parsm.getClassInst('Fleet').save()
          Destroyer = await parsm.getClassInst('Destroyer').save()
          done()
        })
        
        test(`creates a new class of object for joining two other classes`, () => {
          expect.assertions(5)
          return parsm.joinWithTable({Ship: Ship, Fleet: Fleet})
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              const joinedShip = joinObj.get('ship')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
              expect(joinedShip.id).toBe(Ship.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toBe(Fleet.id)
            })
        })
        test(`creates a new class of object for joining two other classes with metadata describing their relationship`, () => {
          return parsm.joinWithTable({Destroyer: Destroyer, Fleet: Fleet}, {active: true})
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Destroyer2Fleet')).toBe(true)
              expect(joinObj.get('active')).toBe(true)
              const joinedDestroyer = joinObj.get('destroyer')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedDestroyer, 'Destroyer')).toBe(true)
              expect(joinedDestroyer.id).toBe(Destroyer.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toBe(Fleet.id)
            })
        })
      })
      
      describe('when called with current parameter types', () => {
        
        let Ship, Fleet, Destroyer
        
        beforeAll(async (done) => {
          Ship = await parsm.getClassInst('Ship').save()
          Fleet = await parsm.getClassInst('Fleet').save()
          Destroyer = await parsm.getClassInst('Destroyer').save()
          done()
        })
        
        test(`creates a new class of object for joining two other classes`, () => {
          expect.assertions(5)
          return parsm.joinWithTable(Ship, Fleet)
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              const joinedShip = joinObj.get('ship')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
              expect(joinedShip.id).toBe(Ship.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toBe(Fleet.id)
            })
        })
        test(`creates a new class of object for joining two other classes with metadata describing their relationship`, () => {
          expect.assertions(6)
          return parsm.joinWithTable(Destroyer, Fleet, {active: true})
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Destroyer2Fleet')).toBe(true)
              expect(joinObj.get('active')).toBe(true)
              const joinedDestroyer = joinObj.get('destroyer')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedDestroyer, 'Destroyer')).toBe(true)
              expect(joinedDestroyer.id).toBe(Destroyer.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toBe(Fleet.id)
            })
        })
      })
      
    })
    
    describe('unJoinWithTable', () => {
      
      let Ship, Fleet
      
      beforeAll(async (done) => {
        Ship = await parsm.getClassInst('Ship').save()
        Fleet = await parsm.getClassInst('Fleet').save()
        done()
      })
      
      test(`when called with deprecated parameter types, removes document from a join table that points to two specific instances of Parse.Object`, () => {
        expect.assertions(10)
        return parsm.joinWithTable({Ship, Fleet})
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            // Verify existence of the new document in the join table:
            return parsm.newQuery('Ship2Fleet', {
              equalTo: ['objectId', joinObj.id],
              include: [['ship', 'fleet']]
            }).first()
          })
          .then(joinObjFound => {
            expect(parsm.isPFObject(joinObjFound, 'Ship2Fleet')).toBe(true)
            // Further verify they are joined using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({
              Ship: parsm.getPointer('Ship', Ship.id),
              Fleet: parsm.getPointer('Fleet', Fleet.id)
            }).first()
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
            expect(joinedShip.id).toBe(Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
            expect(joinedFleet.id).toBe(Fleet.id)
            // Un-join them by removing the document from the join table that points to both:
            return parsm.unJoinWithTable({Ship, Fleet})
          })
          .then(joinObj => {
            // Should receive a copy of the join document that was destroyed:
            expect(joinObj).toBeTruthy()
            // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
              .first()
          })
          .then(joinObj => {
            expect(joinObj).toBeFalsy()
            // Verify that unJoinWithTable returns undefined when it cannot find
            return parsm.unJoinWithTable({Ship, Fleet})
          })
          .then(joinObj => {
            expect(joinObj).toBeFalsy()
          })
        
      })
      
      test(`when called with current parameter types, removes document from a join table that points to two specific instances of Parse.Object`, () => {
        expect.assertions(9)
        return parsm.joinWithTable(Ship, Fleet)
          .then(joinObj => {
            // Verify existence of the new document in the join table:
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            // Further verify they are joined using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship, Fleet})
              .first()
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
            expect(joinedShip.id).toBe(Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
            expect(joinedFleet.id).toBe(Fleet.id)
            // Un-join them by removing the document from the join table that points to both:
            return parsm.unJoinWithTable(Ship, Fleet)
          })
          .then(joinObj => {
            // Should receive a copy of the join document that was destroyed:
            expect(joinObj).toBeTruthy()
            // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
              .first()
          })
          .then(joinObj => {
            expect(joinObj).toBeFalsy()
            // Verify that unJoinWithTable returns undefined when it cannot find
            return parsm.unJoinWithTable(Ship, Fleet)
          })
          .then(joinObj => {
            expect(joinObj).toBeFalsy()
          })
        
      })
      
    })
    
    describe('getJoinQuery', () => {
      
      let Ship, Fleet
      
      beforeAll(async (done) => {
        Ship = await parsm.getClassInst('Ship').save()
        Fleet = await parsm.getClassInst('Fleet').save()
        done()
      })
      
      test(`returns a Parse.Query on a table that joins two subclasses of Parse.Object with pointers`, () => {
        expect.assertions(13)
        return parsm.joinWithTable(Ship, Fleet, {active: true, position: 'flank'})
          .then(joinObj => {
            // Verify existence of the new document in the join table:
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            // Further verify they are joined using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({
              Ship,
              Fleet
            }).first()
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
            expect(joinedShip.id).toBe(Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
            expect(joinedFleet.id).toBe(Fleet.id)
            // Further verify that you can find all ships within a certain fleet:
            return parsm.getJoinQuery({Ship: null, Fleet})
              .find()
          })
          .then(joinObjs => {
            expect(joinObjs).toBeInstanceOf(Array)
            expect(joinObjs).toHaveLength(1)
            const joinObj = joinObjs[0]
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
            expect(joinedShip.id).toBe(Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
            expect(joinedFleet.id).toBe(Fleet.id)
          })
      })
      
      test(`works when pointers are passed as values instead of Pasrse.Objects`, async (done) => {
        expect.assertions(5)
        const joinObj = await parsm.getJoinQuery({
          Ship: Ship.toPointer(),
          Fleet: Fleet.toPointer()
        }).first()
        const joinedShip = joinObj.get('ship')
        const joinedFleet = joinObj.get('fleet')
        expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
        expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
        expect(joinedShip.id).toBe(Ship.id)
        expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
        expect(joinedFleet.id).toBe(Fleet.id)
        done()
      })
      
      test(`throws on invalid classes param`, () => {
        expect(() => parsm.getJoinQuery()).toThrow()
        expect(() => parsm.getJoinQuery({Ship: null})).toThrow()
        expect(() => parsm.getJoinQuery({Ship: 'blah'})).toThrow()
        expect(() => parsm.getJoinQuery({Ship: 'blah', 'Fleet': 'blah'})).toThrow()
        expect(() => parsm.getJoinQuery({Ship: 'blah', 'Fleet': null})).toThrow()
      })
      
      test(`throws on invalid constraints param`, () => {
        expect(() => parsm.getJoinQuery({Ship}, 'blah')).toThrow()
      })
      
    })
    
  })
  
})

describe('pfObjectMatch', () => {
  
  let otherUser
  
  beforeAll(async (done) => {
    otherUser = await new Parse.User({
      username: 'goony',
      password: 'je9w83d',
      email: 'goony@monsters.com'
    }).save()
    done()
  })
  
  test('returns true if 2 pfObjects are the same', () => {
    expect(parsm.pfObjectMatch(testUser, testUser)).toBe(true)
  })
  
  test('returns false if 2 pfObjects are not the same', () => {
    expect(parsm.pfObjectMatch(testUser, otherUser)).toBe(false)
  })
  
  test('returns true if a pointer points to corresponding pfObject', () => {
    expect(parsm.pfObjectMatch(testUser.toPointer(), testUser)).toBe(true)
  })
  
  test('returns true if a pointer does not point to corresponding pfObject', async () => {
    expect(parsm.pfObjectMatch(testUser.toPointer(), otherUser)).toBe(false)
  })
  
  test('returns false if one or both parameters are not pfObjects or pointers', () => {
    expect(parsm.pfObjectMatch(testUser, 'blah')).toBe(false)
    expect(parsm.pfObjectMatch(testUser.toPointer(), 'blah')).toBe(false)
    expect(parsm.pfObjectMatch('blah', 'blah')).toBe(false)
  })
  
})

describe('isPFObject', () => {
  
  beforeAll(setTestObjects)
  
  test('checks a valid Parse.Object', () => {
    expect(parsm.isPFObject(unsavedParseObj)).toBe(true)
  })
  test('checks Parse.Object of a certain class by class name', () => {
    expect(parsm.isPFObject(unsavedParseObj, 'TheParseObj')).toBe(true)
  })
  test('ignores invalid "ofClass" parameter', () => {
    expect(parsm.isPFObject(unsavedParseObj, 3)).toBe(true)
  })
  test('checks a special sub-class of Parse.Object, like "User"', () => {
    expect(parsm.isPFObject(testUser, 'User')).toBe(true)
  })
  test('returns false for pointer created locally as plain object', () => {
    expect(parsm.isPFObject({__type: 'Pointer', className: 'HairBall', objectId: 'kjasoiuwne'})).toBe(false)
  })
  test('returns false for pointer created with Parse.Object.toPointer', () => {
    expect(parsm.isPFObject(savedBouquets[0].toPointer())).toBe(false)
  })
  test('returns true for Parse.Object subclass reference created with Parse.Object.createWithoutData', () => {
    expect(parsm.isPFObject(TheParseObj.createWithoutData('ihsd978h293'))).toBe(true)
  })
  
})

describe('isPointer', () => {
  
  let savedParseObj
  
  beforeAll(() => {
      return setTestObjects()
        .then(() => unsavedParseObj.save())
        .then(obj => {
          savedParseObj = obj
        })
    }
  )
  
  test('should return false for scalars', () => {
    expect(parsm.isPointer('Schnauser')).toBe(false)
    expect(parsm.isPointer(1)).toBe(false)
  })
  test('should return false for non-qualifying objects', () => {
    expect(parsm.isPointer(null)).toBe(false)
    expect(parsm.isPointer(savedParseObj)).toBe(false)
    expect(parsm.isPointer(parsm.toJsn(savedParseObj))).toBe(false)
    expect(parsm.isPointer({__type: 'Pointer', className: 'HairBall'})).toBe(false)
    expect(parsm.isPointer(TheParseObj.createWithoutData('ihsd978h293'))).toBe(false)
  })
  test('should return true for qualifying objects', () => {
    expect(parsm.isPointer(savedParseObj.toPointer())).toBe(true)
    expect(parsm.isPointer({className: 'HairBall', objectId: 'kjasoiuwne'})).toBe(true)
    expect(parsm.isPointer(parsm.toJsn(savedParseObj.toPointer()))).toBe(true)
  })
  test('should return true for qualifying objects of a specified class', () => {
    expect(parsm.isPointer(savedParseObj.toPointer(), 'TheParseObj')).toBe(true)
    expect(parsm.isPointer({className: 'HairBall', objectId: 'kjasoiuwne'}, 'HairBall')).toBe(true)
  })
})

describe('isPFObjectOrPointer', () => {
  
  describe('returns true for Parse.Objects', () => {
    
    beforeAll(setTestObjects)
    
    test('checks a valid Parse.Object', () => {
      expect(parsm.isPFObjectOrPointer(unsavedParseObj)).toBe(true)
    })
    test('checks Parse.Object of a certain class by class name', () => {
      expect(parsm.isPFObjectOrPointer(unsavedParseObj, 'TheParseObj')).toBe(true)
    })
    test('ignores invalid "ofClass" parameter', () => {
      expect(parsm.isPFObjectOrPointer(unsavedParseObj, 3)).toBe(true)
    })
    test('checks a special sub-class of Parse.Object, like "User"', () => {
      expect(parsm.isPFObjectOrPointer(testUser, 'User')).toBe(true)
    })
    test('returns true for pointer created locally as plain object', () => {
      expect(parsm.isPFObjectOrPointer({__type: 'Pointer', className: 'HairBall', objectId: 'kjasoiuwne'})).toBe(true)
    })
    test('returns false for pointer created with Parse.Object.toPointer', () => {
      expect(parsm.isPFObjectOrPointer(savedBouquets[0].toPointer())).toBe(true)
    })
    test('returns true for Parse.Object subclass reference created with Parse.Object.createWithoutData', () => {
      expect(parsm.isPFObjectOrPointer(TheParseObj.createWithoutData('ihsd978h293'))).toBe(true)
    })
    
  })
  
  describe('returns true for pointers', () => {
    
    let savedParseObj
    
    beforeAll(() => {
        return setTestObjects()
          .then(() => unsavedParseObj.save())
          .then(obj => {
            savedParseObj = obj
          })
      }
    )
    
    test('should return false for scalars', () => {
      expect(parsm.isPFObjectOrPointer('Schnauser')).toBe(false)
      expect(parsm.isPFObjectOrPointer(1)).toBe(false)
    })
    test('should return true for qualifying objects', () => {
      expect(parsm.isPFObjectOrPointer(null)).toBe(false)
      expect(parsm.isPFObjectOrPointer(savedParseObj)).toBe(true)
      expect(parsm.isPFObjectOrPointer(parsm.toJsn(savedParseObj))).toBe(false)
      expect(parsm.isPFObjectOrPointer({__type: 'Pointer', className: 'HairBall'})).toBe(false)
      expect(parsm.isPFObjectOrPointer(TheParseObj.createWithoutData('ihsd978h293'))).toBe(true)
    })
    test('should return true for qualifying objects', () => {
      expect(parsm.isPFObjectOrPointer(savedParseObj.toPointer())).toBe(true)
      expect(parsm.isPFObjectOrPointer({className: 'HairBall', objectId: 'kjasoiuwne'})).toBe(true)
      expect(parsm.isPFObjectOrPointer(parsm.toJsn(savedParseObj.toPointer()))).toBe(true)
    })
    test('should return true for qualifying objects of a specified class', () => {
      expect(parsm.isPFObjectOrPointer(savedParseObj.toPointer(), 'TheParseObj')).toBe(true)
      expect(parsm.isPFObjectOrPointer({className: 'HairBall', objectId: 'kjasoiuwne'}, 'HairBall')).toBe(true)
    })
  })
  
})

describe('getPFObjectClassName', () => {
  
  beforeAll(setTestObjects)
  
  test('returns valid class-name of a subclass of Parse.Object without leading underscore', () => {
    expect(parsm.getPFObjectClassName(unsavedParseObj)).toBe('TheParseObj')
    expect(parsm.getPFObjectClassName('User')).toBe('User')
    expect(parsm.getPFObjectClassName('_User')).toBe('User')
    expect(parsm.getPFObjectClassName(testUser)).toBe('User')
    expect(parsm.getPFObjectClassName('_Session')).toBe('Session')
    expect(parsm.getPFObjectClassName({naughty: 'object'})).not.toBeTruthy()
    expect(parsm.getPFObjectClassName([1, 2, 3])).not.toBeTruthy()
    expect(parsm.getPFObjectClassName()).not.toBeTruthy()
  })
})

describe('isUser', () => {
  const user = new Parse.User()
  test('determines if an object created with new Parse.User(...) -- but not yet saved -- is an instance of Parse.User', () => {
    expect(parsm.isUser(user)).toBe(true)
  })
  test('determines if the same object with some attributes set is an instance of Parse.User', () => {
    parsm.objSetMulti(user,
      {
        username: 'stanman',
        password: '823980jdlksjd9',
        email: 'stan@theman.com'
      }
    )
    expect(parsm.isUser(user)).toBe(true)
  })
  test('determines if an object created with new Parse.User(...) -- and then saved -- is an instance of Parse.User', () => {
    return user.signUp()
      .then(signedUpUser => {
        expect(parsm.isUser(signedUpUser)).toBe(true)
      })
  })
  test('determines if a pointer to a User is a not an instance of Parse.User', () => {
    expect(parsm.isUser(user.toPointer())).toBe(false)
  })
  test('determines if a object is a not an instance of Parse.User', () => {
    expect(parsm.isUser(unsavedParseObj)).toBe(false)
  })
})

describe('getPointer', () => {
  test('returns a pointer to a custom class', () => {
    const result = parsm.getPointer('Horse', 'hsueji22')
    expect(result).toBeInstanceOf(Object)
    expect(result.className).toBe('Horse')
    expect(result.id).toBe('hsueji22')
  })
  test('returns a pointer to a special class', () => {
    const user = parsm.getPointer('User', 'hsueji22')
    expect(user).toBeInstanceOf(Object)
    expect(user.className).toBe('_User')
    expect(user.id).toBe('hsueji22')
    const role = parsm.getPointer('Role', 'hsueji22')
    expect(role).toBeInstanceOf(Object)
    expect(role.className).toBe('_Role')
    expect(role.id).toBe('hsueji22')
  })
  test('generates pointers that can be fetched', () => {
    const horse = parsm.getClassInst('Horse', {
      hair: 'brown',
      nose: 'black'
    })
    return horse.save()
      .then(obj => {
        expect(obj.get('hair')).toBe('brown')
        const horseP = parsm.getPointer('Horse', horse.id)
        return horseP.fetch()
      })
      .then(fetchedHorse => {
        expect(parsm.isPFObject(fetchedHorse, 'Horse')).toBe(true)
        expect(fetchedHorse.get('hair')).toBe('brown')
        expect(fetchedHorse.get('nose')).toBe('black')
        
      })
  })
  test('throws error when passed invalid params', () => {
    const errMsg = 'getPointer called with non-string parameters'
    expect(() => parsm.getPointer('Horse', 23)).toThrow(errMsg)
    expect(() => parsm.getPointer({hello: 'there'}, 'asd')).toThrow(errMsg)
    expect(() => parsm.getPointer()).toThrow(errMsg)
  })
})

describe('copyPFObjectAttributes', () => {
  
  test('copies attributes from one pfObject to another', () => {
    const dog1 = parsm.getClassInst('Dog', {
      name: 'Banshee',
      length: 36,
      width: 15,
      clean: true
    })
    const dog2 = parsm.getClassInst('Dog', {
      name: 'Kujo',
      length: 40,
      width: 21,
      clean: false
    })
    expect(dog1.get('length')).toBe(36)
    expect(dog1.get('width')).toBe(15)
    expect(dog2.get('length')).toBe(40)
    expect(dog2.get('width')).toBe(21)
    parsm.copyPFObjectAttributes(dog1, dog2, 'length,width')
    expect(dog2.get('length')).toBe(36)
    expect(dog2.get('width')).toBe(15)
    expect(dog2.get('clean')).toBe(false)
  })
  
})

describe('keysAreDirty', () => {
  
  test('should return true if any of the given array of keys are dirty in parseObj', () => {
    expect.assertions(3)
    return parsm.getClassInst('Dog', {
      name: 'Banshee',
      length: 36,
      width: 15,
      clean: true
    }).save()
      .then( dog => {
        expect(parsm.keysAreDirty(dog, ['name','length'])).toBe(false)
        dog.set('length', 37)
        dog.set('width', 16)
        expect(parsm.keysAreDirty(dog, ['length','width'])).toBe(true)
        expect(parsm.keysAreDirty(dog, 'length,width')).toBe(true)
      })
  })
  
})

describe('classStringOrSpecialClass', () => {
  test('converts the unchanged string if not a special Parse class', () => {
    expect(parsm.classStringOrSpecialClass('Horse')).toBe('Horse')
  })
  test('converts "User" to Parse.User', () => {
    expect(parsm.classStringOrSpecialClass('User')).toBe(Parse.User)
  })
  test('converts "Session" to Parse.Session', () => {
    expect(parsm.classStringOrSpecialClass('Session')).toBe(Parse.Session)
  })
  test('converts "Role" to Parse.Role', () => {
    expect(parsm.classStringOrSpecialClass('Role')).toBe(Parse.Role)
  })
})

describe('classNameToParseClassName', () => {
  test('does not change a custom subclass name', () => {
    expect(parsm.classNameToParseClassName('Horse')).toBe('Horse')
  })
  test('prefixes special Parse class with underscore', () => {
    expect(parsm.classNameToParseClassName('User')).toBe('_User')
  })
})

describe('_toArray', () => {
  
  const arr = [1, 2, 3]
  const csv = '1,2,3'
  
  test('should return array if passed array', () => {
    expect(parsm._toArray(arr)).toBe(arr)
  })
  
  test('should return array of items if passed comma-separated list', () => {
    expect(parsm._toArray(csv)).toEqual(['1', '2', '3'])
  })
  
  test('should return non-array, non-string value as array with the value as the only item', () => {
    expect(parsm._toArray(56)).toEqual([56])
  })
  
  test('should return non-array, non-string value as array with the value as the only item', () => {
    expect(parsm._toArray()).toEqual([undefined])
  })
  
  test('should return array of only the strings from an array of different types of values if the "type" parameter is "string"', () => {
    const mixedArray = [
      1,
      'hello',
      {to: 'be', or: 'not'},
      'there',
      null,
      undefined,
      true,
      'dude',
      false
    ]
    expect(parsm._toArray(mixedArray, 'string')).toEqual(['hello', 'there', 'dude'])
  })
  
})