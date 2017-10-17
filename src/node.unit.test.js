'use strict'

import Parse from 'parse/node'
import ParseMockDB from 'parse-mockdb'
import parsm from './node'


Parse.initialize('test')

var savedBouquets

beforeAll(() => {
  ParseMockDB.mockDB() // Mock the Parse RESTController
  const bouquets = []
  for(let i = 0; i < 10; i++) {
    bouquets.push(parsm.getClassInst('Bouquet', {active:false}))
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
    test('returns the passed value when it is not a Parse object or a plain, non-null object', () => {
      const mySymbol = Symbol('test')
      expect(parsm.toJsn(mySymbol)).toEqual(mySymbol)
      expect(parsm.toJsn(undefined)).toEqual(undefined)
      expect(parsm.toJsn(null)).toEqual(null)
      expect(parsm.toJsn(true)).toEqual(true)
      expect(parsm.toJsn(2)).toEqual(2)
      expect(parsm.toJsn('abc')).toEqual('abc')
    })
    test('returns a shallow JSON representation of a Parse object', () => {
      expect(parsm.toJsn(aParseObj)).toBeEquivalentObject({
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
    test('returns deep JSON representation of a plain object containing a Parse object', () => {
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
    test('returns deep JSON representation of a plain object containing a Parse object that has an objectId key', () => {
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
    test('gets some columns from a Parse object and returns them in a plain object', () => {
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
    test('sets some columns on a Parse object from a plain object', () => {
      parsm.objSetMulti(aParseObj, {
        valley: 'big',
        river: 'deep'
      })
      expect(aParseObj.get('river')).toBe('deep')
    })
    test('sets some columns on a Parse object from a plain object, not merging sub-objects', () => {
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
    test('sets some columns on a Parse object from a plain object, merging sub-objects', () => {
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
  
  describe('newQuery', () => {
    test('returns a query that finds all instances of a Parse class', () => {
      expect.assertions(4)
      return parsm.newQuery('Bouquet').find()
        .then(objs => {
          expect(objs).toHaveLength(savedBouquets.length)
          expect(parsm.isPFObject(objs[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(objs[9], 'Bouquet')).toBe(true)
          expect(objs[9].id).toBe((parseInt(objs[0].id)+9).toString())
        })
    })
    test('returns a query limited to first n instances of a Parse class', () => {
      expect.assertions(4)
      return parsm.newQuery('Bouquet', {limit:5}).find()
        .then(objs => {
          expect(objs).toHaveLength(5)
          expect(parsm.isPFObject(objs[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(objs[4], 'Bouquet')).toBe(true)
          expect(objs[4].id).toBe((parseInt(objs[0].id)+4).toString())
        })
    })
    test('returns a query skipping first n instances of a Parse class', () => {
      expect.assertions(5)
      return parsm.newQuery('Bouquet', {skip:5}).find()
        .then(objs => {
          expect(objs).toHaveLength(5)
          expect(parsm.isPFObject(objs[0], 'Bouquet')).toBe(true)
          expect(parsm.isPFObject(objs[4], 'Bouquet')).toBe(true)
          expect(objs[0].id).toBe(savedBouquets[5].id)
          expect(objs[4].id).toBe(savedBouquets[9].id)
        })
      })
  })
  
  describe('getObjById', () => {
    test('gets a Parse object from db by id', () => {
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
    test('gets a Parse user by id', () => {
      expect.assertions(1)
      const user = new Parse.User({
        username:'foo manchu',
        password:'je9w83d',
        email:'foo@bar.com'
      })
      return user.signUp()
        .then(aUser => parsm.getUserById(aUser.id))
        .then(aUser => {
          expect(parsm.isPFObject(aUser, 'User')).toBe(true)
        })
    })
  })
  
  describe('fetchIfNeeded, given a value <thing>, return a promise that resolves to', () => {
    test('thing if thing is a clean Parse.Object', () => {
      return parsm.fetchIfNeeded(savedBouquets[0])
      .then(result => {
        expect(result).toBe(savedBouquets[0])
      })
    })
    test('fetched Parse.Object if thing is a dirty Parse.Object', () => {
      savedBouquets[0].set('active',true)
      return parsm.fetchIfNeeded(savedBouquets[0])
        .then(result => {
          expect(result.get('active')).toBe(false)
        })
    })
    test('fetched Parse.Object if thing is a pointer', () => {
      return parsm.fetchIfNeeded(savedBouquets[0].toPointer())
        .then(result => {
          expect(result).toBeDefined()
          expect(parsm.isPFObject(result)).toBe(true)
          expect(parsm.isPFObject(result,'Bouquet')).toBe(true)
        })
    })
    test('thing if otherwise', () => {
      return expect(parsm.fetchIfNeeded('blah')).resolves.toEqual('blah')
    })
  })
  
  describe('Roles', () => {
    
    const roleACL = new Parse.ACL()
    roleACL.setPublicReadAccess(true)
    const adminRole = new Parse.Role("Administrator", roleACL)
    const modRole = new Parse.Role("Moderator", roleACL)
  
    describe('userHasRole', () => {
      test('determines if a user has a single role', () => {
        expect.assertions(4)
        const user = new Parse.User({
          username:'foo manchu',
          password:'je9w83d',
          email:'foo@bar.com'
        })
        return user.signUp()
          .then(aUser => {
            return parsm.userHasRole(aUser, 'Administrator')
              .then(hasRole => {
                expect(hasRole).toBe(false)
                return adminRole.getUsers()
                  .add(aUser)
                  .save()
                  .then(() => parsm.userHasRole(aUser, 'Administrator'))
              })
              .then(hasRole => {
                expect(hasRole).toBe(true)
                return modRole.getUsers()
                  .add(aUser)
                  .save()
                  .then(() => parsm.userHasRole(aUser, {
                    names: ['Administrator', 'Moderator'],
                    op: 'and'
                  }))
              })
              .then(hasRoles => {
                expect(hasRoles).toBe(true)
                return parsm.userHasRole(aUser, {
                  names: ['Administrator', 'Moderator'],
                  op: 'or'
                })
              })
              .then(hasRoles => {
                expect(hasRoles).toBe(true)
              })
          })
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
        expect.assertions(3)
        const user = new Parse.User({
          username:'blastois',
          password:'je9w83d',
          email:'foo@bar.com'
        })
        return user.save()
          .then(aUser => {
            return parsm.getUserRoles(aUser)
              .then(roles => {
                expect(roles).toEqual([])
                return adminRole
                  .getUsers()
                  .add(aUser)
                  .save()
                  .then(() => parsm.getUserRoles(aUser))
                  .then(roles => {
                    expect(roles.length).toBe(1)
                    expect(roles[0]).toBe("Administrator")
                  })
              })
          })
      })
    })
    
  })
  
  describe('getClassInst', () => {
    test('returns a subclass of Parse.Object', () => {
      const inst = parsm.getClassInst('Colors')
      expect(inst.className === 'Colors').toBe(true)
    })
    test('returns a subclass of Parse.Object with some attributes set', () => {
      const inst = parsm.getClassInst('Birds', {
        raven:{
          color:'black'
        },
        dove:{
          color:'white'
        }
      })
      expect(inst.className === 'Birds').toBe(true)
      expect(inst.get('raven').color).toBe('black')
      expect(inst.get('dove').color).toBe('white')
    })
  })
  
  describe('Relationships', () => {
    
    describe('Many-to-Many with Join Tables', () => {
  
      describe('getJoinTableName', () => {
        test(`returns a name for a table used to join two other tables; format: <first table name>2<second table name>`, () => {
          expect(parsm.getJoinTableName('Employee','Company')).toBe('Employee2Company')
        })
      })
  
      describe('joinWithTable', () => {
        const Ship = parsm.getClassInst('Ship')
        const Destroyer = parsm.getClassInst('Destroyer')
        const Fleet = parsm.getClassInst('Fleet')
        const origObjs = {}
        test(`creates a new class of object for joining two other classes`, () => {
          expect.assertions(5)
          return Parse.Object.saveAll([Ship, Destroyer, Fleet])
            .then(savedObjs => {
              origObjs.Ship = savedObjs[0]
              origObjs.Destroyer = savedObjs[1]
              origObjs.Fleet = savedObjs[2]
              return parsm.joinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
            })
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              const joinedShip = joinObj.get('ship')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
              expect(joinedShip.id).toEqual(origObjs.Ship.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toEqual(origObjs.Fleet.id)
            })
        })
        test(`creates a new class of object for joining two other classes with metadata describing their relationship`, () => {
          expect.assertions(6)
          return parsm.joinWithTable({Destroyer:origObjs.Destroyer, Fleet:origObjs.Fleet}, {active:true})
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Destroyer2Fleet')).toBe(true)
              expect(joinObj.get('active')).toBe(true)
              const joinedDestroyer = joinObj.get('destroyer')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedDestroyer, 'Destroyer')).toBe(true)
              expect(joinedDestroyer.id).toEqual(origObjs.Destroyer.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toEqual(origObjs.Fleet.id)
            })
        })
      })
  
      describe('unJoinWithTable', () => {
        const Ship = parsm.getClassInst('Ship')
        const Fleet = parsm.getClassInst('Fleet')
        const origObjs = {}
        test(`removes document from a join table that points to two specific instances of Parse.Object`, () => {
          expect.assertions(9)
          // Create a couple of different objects:
          return Parse.Object.saveAll([Ship, Fleet])
            .then(savedObjs => {
              origObjs.Ship = savedObjs[0]
              origObjs.Fleet = savedObjs[1]
              // Join them with a third table:
              return parsm.joinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
            })
            .then(joinObj => {
              // Verify existence of the new document in the join table:
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              // Further verify they are joined using parsimonious.getJoinQuery:
              return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
                .first()
            })
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              const joinedShip = joinObj.get('ship')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
              expect(joinedShip.id).toEqual(origObjs.Ship.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toEqual(origObjs.Fleet.id)
              // Un-join them by removing the document from the join table that points to both:
              return parsm.unJoinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
            })
            .then(joinObj => {
              // Should receive a copy of the join document that was destroyed:
              expect(joinObj).toBeDefined()
              // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
              return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
                .first()
            })
            .then(joinObj => {
              expect(joinObj).toBeUndefined()
              // Verify that unJoinWithTable returns undefined when it cannot find
              return parsm.unJoinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
            })
            .then(joinObj => {
              expect(joinObj).toBeUndefined()
            })
      
        })
      })
  
      describe('getJoinQuery', () => {
        const Ship = parsm.getClassInst('Ship')
        const Fleet = parsm.getClassInst('Fleet')
        const origObjs = {}
        test(`returns a Parse.Query on a table that joins two subclasses of Parse.Object with pointers`, () => {
          expect.assertions(10)
          // Create a couple of different objects:
          return Parse.Object.saveAll([Ship, Fleet])
            .then(savedObjs => {
              origObjs.Ship = savedObjs[0]
              origObjs.Fleet = savedObjs[1]
              // Join them with a third table and include some metadata so we can test the 'select' parameter later:
              return parsm.joinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet}, {active:true, position:'flank'})
            })
            .then(joinObj => {
              // Verify existence of the new document in the join table:
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              // Further verify they are joined using parsimonious.getJoinQuery:
              return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
                .first()
            })
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              const joinedShip = joinObj.get('ship')
              const joinedFleet = joinObj.get('fleet')
              expect(parsm.isPFObject(joinedShip, 'Ship')).toBe(true)
              expect(joinedShip.id).toEqual(origObjs.Ship.id)
              expect(parsm.isPFObject(joinedFleet, 'Fleet')).toBe(true)
              expect(joinedFleet.id).toEqual(origObjs.Fleet.id)
              // Test 'select' parameter
              return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')}, {select: 'active'})
                .first()
            })
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              expect(joinObj.get('active')).toBe(true)
              // TODO I can't get query.select to work. It might be parse-mockdb. expect(joinObj.get('position')).toBeUndefined()
              return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')}, {select: ['position']})
                .first()
            })
            .then(joinObj => {
              expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).toBe(true)
              expect(joinObj.get('position')).toBe('flank')
              // TODO I can't get query.select to work. It might be parse-mockdb. expect(joinObj.get('position')).toBeUndefined()
            })
      
        })
      })
      
    })
    
  })
  
  describe('isPointer', () => {
    test('should return false for scalars', () => {
      expect(parsm.isPointer('Schnauser')).toBe(false)
      expect(parsm.isPointer(1)).toBe(false)
    })
    test('should return false for non-qualifying objects', () => {
      expect(parsm.isPointer(null)).toBe(false)
      expect(parsm.isPointer({className:'HairBall', objectId:'kjasoiuwne'})).toBe(false)
      expect(parsm.isPointer({__type:'Pointer',className:'HairBall'})).toBe(false)
    })
    test('should return true for qualifying objects', () => {
      expect(parsm.isPointer({__type:'Pointer', className:'HairBall', objectId:'kjasoiuwne'})).toBe(true)
      expect(parsm.isPointer(savedBouquets[0].toPointer())).toBe(true)
      expect(parsm.isPointer(TheParseObj.createWithoutData('ihsd978h293'))).toBe(true)
    })
  })
  
  describe('isPFObject', () => {
    test('checks a valid Parse.Object', () => {
      expect(parsm.isPFObject(aParseObj)).toBe(true)
    })
    test('checks Parse.Object of a certain class', () => {
      expect(parsm.isPFObject(aParseObj, 'TheParseObj')).toBe(true)
    })
    test('ignores invalid "ofClass" parameter', () => {
      expect(parsm.isPFObject(aParseObj, 3)).toBe(true)
    })
    test('checks a special sub-class of Parse.Object, like "User"', () => {
      expect.assertions(1)
      const user = new Parse.User({
        username:'chuck biff',
        password:'je9w83d',
        email:'chuck@bar.com'
      })
      return user.signUp()
        .then(aUser => {
          expect(parsm.isPFObject(aUser, 'User')).toBe(true)
        })
    })
    test('returns false for pointer created locally as plain object', () => {
      expect(parsm.isPFObject({__type:'Pointer', className:'HairBall', objectId:'kjasoiuwne'})).toBe(false)
    })
    test('returns false for pointer created with Parse.Object.toPointer', () => {
      expect(parsm.isPFObject(savedBouquets[0].toPointer())).toBe(false)
    })
    test('returns true for Parse.Object subclass reference created with Parse.Object.createWithoutData', () => {
      expect(parsm.isPFObject(TheParseObj.createWithoutData('ihsd978h293'))).toBe(true)
    })
  })
  
  describe('getPFObjectClassName', () => {
    const user = new Parse.User({
      username:'foo manchu',
      password:'je9w83d',
      email:'foo@bar.com'
    })
    test('returns valid class-name of a subclass of Parse.Object without leading underscore', () => {
      expect(parsm.getPFObjectClassName(aParseObj)).toBe('TheParseObj')
      expect(parsm.getPFObjectClassName('User')).toBe('User')
      expect(parsm.getPFObjectClassName('_User')).toBe('User')
      expect(parsm.getPFObjectClassName(user)).toBe('User')
      expect(parsm.getPFObjectClassName('_Session')).toBe('Session')
      expect(parsm.getPFObjectClassName({naughty:'object'})).not.toBeDefined()
      expect(parsm.getPFObjectClassName([1,2,3])).not.toBeDefined()
    })
  })
  
  describe('isUser', () => {
    test('determines if a variable is a Parse.User', () => {
      expect.assertions(1)
      const user = new Parse.User({
        username:'chuck biff',
        password:'823980jdlksjd9',
        email:'chuck@wow.com'
      })
      return user.signUp()
        .then(aUser => {
          expect(parsm.isUser(aUser)).toBe(true)
        })
    })
    test('determines if a variable is a not a Parse.User', () => {
      expect(parsm.isUser(aParseObj)).toBe(false)
    })
  })
  
})