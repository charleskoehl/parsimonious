'use strict'

import Parse from 'parse/node'
import parsm from '../src/index'
import ParseMockDB from 'parse-mockdb'
import chai from 'chai'

chai.use(require('chai-shallow-deep-equal'))
chai.use(require('chai-as-promised'))
const expect = chai.expect


try {
  Parse.initialize('test')
  parsm.setParse(Parse) // Works without this line, but might need if switch from mocha to jest.
} catch(e) {
  console.error('Could not initialize Parse or Parsimonious because could not find a valid Parse object:', e)
  process.exit(1);
}


let savedBouquets,
  TheParseObj = Parse.Object.extend('TheParseObj'),
  unsavedParseObj = new TheParseObj(),
  savedParseObj

before( () => {
  ParseMockDB.mockDB() // Mock the Parse RESTController
  return unsavedParseObj.save({
    roses:'red',
    violets:'blue',
    grass:'green'
  })
    .then(obj => {
      savedParseObj = obj
      const ints = Array.from(Array(10).keys())
      const bouquetSaves = ints.map(n => parsm.getClassInst('Bouquet').save({active:false, aNum:n}))
      return Parse.Promise.when(bouquetSaves)
        .then(objs => {
          savedBouquets = objs
          return objs
        })
    })
})

after(() => {
  ParseMockDB.cleanUp(); // Clear the Database
  ParseMockDB.unMockDB(); // Un-mock the Parse RESTController
})

describe('setParse', () => {
  it('sets a valid instance of Parse to use', () => {
    expect(() => parsm.setParse(Parse)).not.to.throw()
  })
  it('throws TypeError when invalid instance of Parse is passed', () => {
    expect(() => parsm.setParse('blah')).to.throw('non-object passed as Parse object')
  })
})

describe('toJsn', () => {
  it('returns the passed value when it is not a Parse object or a plain, non-null object', () => {
    const mySymbol = Symbol('test')
    expect(parsm.toJsn(mySymbol)).to.equal(mySymbol)
    expect(parsm.toJsn()).to.equal()
    expect(parsm.toJsn(undefined)).to.equal(undefined)
    expect(parsm.toJsn(null)).to.equal(null)
    expect(parsm.toJsn(true)).to.be.true
    expect(parsm.toJsn(2)).to.equal(2)
    expect(parsm.toJsn('abc')).to.equal('abc')
  })
  it('returns a shallow JSON representation of a Parse object', () => {
    expect(parsm.toJsn(unsavedParseObj)).to.shallowDeepEqual({
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
    expect(parsm.toJsn(plainObj, true)).to.shallowDeepEqual({
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
      aParseObj: unsavedParseObj
    }
    expect(parsm.toJsn(someObj, true)).to.shallowDeepEqual({
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
    unsavedParseObj.set('objectId', 'iei38s')
    const someObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: unsavedParseObj
    }
    expect(parsm.toJsn(someObj, true)).to.shallowDeepEqual({
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
    expect(parsm.objPick(unsavedParseObj, 'roses,grass')).to.eql({
      roses: 'red',
      grass: 'green'
    })
    expect(parsm.objPick(unsavedParseObj, ['roses', 'grass'])).to.eql({
      roses: 'red',
      grass: 'green'
    })
  })
})

describe('objGetDeep', () => {
  it('Get an an object-type column from a Parse object and return the value of a nested key within it', () => {
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
    expect(someObj.get('depts')).to.be.an('object')
    expect(someObj.get('depts').accounting.employees[0].name).to.equal('fred')
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees[0].name')).to.equal('fred')
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees')).to.have.lengthOf(2)
  })
})

describe('objSetMulti', () => {
  it('sets some columns on a Parse object from a plain object', () => {
    parsm.objSetMulti(unsavedParseObj, {
      valley: 'big',
      river: 'deep'
    })
    expect(unsavedParseObj.get('river')).to.equal('deep')
  })
  it('sets some columns on a Parse object from a plain object, not merging sub-objects', () => {
    unsavedParseObj.set('ocean', {
      size:'large',
      color:'blue',
      denizens:'fish'
    })
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size:'medium',
        color:'green'
      }
    })
    expect(unsavedParseObj.get('ocean')).to.shallowDeepEqual({
      size:'medium',
      color:'green'
    })
  })
  it('sets some columns on a Parse object from a plain object, merging sub-objects', () => {
    unsavedParseObj.set('ocean', {
      size:'large',
      color:'blue',
      denizens:'fish'
    })
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size:'medium',
        color:'green'
      }
    }, true)
    expect(unsavedParseObj.get('ocean')).to.shallowDeepEqual({
      size:'medium',
      color:'green',
      denizens:'fish'
    })
  })
})

describe('newQuery', () => {
  it('returns a query that finds all instances of a Parse class', () => {
    return parsm.newQuery('Bouquet').find()
      .then(objs => {
        expect(objs).to.have.lengthOf(savedBouquets.length)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true
        expect(parsm.isPFObject(objs[9], 'Bouquet')).to.be.true
        expect(objs[9].id).to.equal((parseInt(objs[0].id)+9).toString())
      })
  })
  
  it('returns a query limited to first n instances of a Parse class', () => {
    return parsm.newQuery('Bouquet', {limit:5}).find()
      .then(objs => {
        expect(objs).to.have.lengthOf(5)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true
        expect(parsm.isPFObject(objs[4], 'Bouquet')).to.be.true
        expect(objs[4].id).to.equal((parseInt(objs[0].id)+4).toString())
      })
  })
  it('returns a query skipping first n instances of a Parse class', () => {
    return parsm.newQuery('Bouquet', {skip:5}).find()
      .then(objs => {
        expect(objs).to.have.lengthOf(5)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true
        expect(parsm.isPFObject(objs[4], 'Bouquet')).to.be.true
        expect(objs[0].id).to.equal(savedBouquets[5].id)
        expect(objs[4].id).to.equal(savedBouquets[9].id)
      })
  })
  it('returns a query that selects only a certain column to be returned', () => {
    return parsm.newQuery('Bouquet', {select:'aNum'}).find()
      .then(objs => {
        expect(objs).to.have.lengthOf(10)
        expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true
        expect(parsm.isPFObject(objs[9], 'Bouquet')).to.be.true
        expect(objs[0].id).to.equal(savedBouquets[0].id)
        expect(objs[9].id).to.equal(savedBouquets[9].id)
        expect(objs[6].get('aNum')).to.equal(6)
        // TODO parse-mockdb module does not seem to apply Parse.Query.select function, so next line fails:
        // expect(objs[6].get('active')).to.be.undefined
      })
  })
  
})

describe('getObjById', () => {
  it('gets a Parse object from db by id', () => {
    const aParseObj = new TheParseObj()
    let newObjId
    return aParseObj
      .save({roses:'red'})
      .then(savedObj => {
        newObjId = savedObj.id
        return parsm.getObjById('TheParseObj', newObjId)
      })
      .then(retrievedObj => {
        expect(parsm.isPFObject(retrievedObj)).to.be.true
        expect(retrievedObj.id).to.equal(newObjId)
      })
  })
})

describe('getUserById', () => {
  it('gets a Parse user by id', () => {
    const user = new Parse.User({
      username:'foo manchu',
      password:'je9w83d',
      email:'foo@bar.com'
    })
    return user.signUp()
      .then(aUser => parsm.getUserById(aUser.id))
      .then(aUser => {
        expect(parsm.isPFObject(aUser, 'User')).to.be.true
      })
  })
})

describe('fetchIfNeeded, given a value <thing>, return a promise that resolves to', () => {
  it('thing if thing is a clean Parse.Object', () => {
    return parsm.fetchIfNeeded(savedBouquets[0])
    .then(result => {
      expect(result).to.equal(savedBouquets[0])
    })
  })
  it('fetched Parse.Object if thing is a dirty Parse.Object', () => {
    savedBouquets[0].set('active',true)
    return parsm.fetchIfNeeded(savedBouquets[0])
      .then(result => {
        expect(result.get('active')).to.equal(false)
      })
  })
  it('fetched Parse.Object if thing is a pointer', () => {
    return parsm.fetchIfNeeded(savedBouquets[0].toPointer())
      .then(result => {
        expect(result).to.be.ok
        expect(parsm.isPFObject(result)).to.be.true
        expect(parsm.isPFObject(result,'Bouquet')).to.be.true
      })
  })
  it('thing if otherwise', () => {
    return expect(parsm.fetchIfNeeded('blah')).to.eventually.equal('blah')
  })
})

describe('Roles', () => {
  
  const roleACL = new Parse.ACL()
  roleACL.setPublicReadAccess(true)
  const adminRole = new Parse.Role("Administrator", roleACL)
  const modRole = new Parse.Role("Moderator", roleACL)

  describe('userHasRole', () => {
    
    let user
    
    before( () => {
      return new Parse.User({
        username:'foo manchu',
        password:'je9w83d',
        email:'foo@bar.com'
      }).signUp()
        .then(aUser => {
          user = aUser
        })
    })
    
    it('determines if a user has a single role', () => {
        return parsm.userHasRole(user, 'Administrator')
          .then(hasRole => {
            expect(hasRole).to.equal(false)
            return adminRole.getUsers()
              .add(user)
              .save()
              .then(() => parsm.userHasRole(user, 'Administrator'))
          })
          .then(hasRole => {
            expect(hasRole).to.be.true
            return parsm.userHasRole(user, {
              names: ['Administrator', 'Moderator'],
              op: 'or'
            })
          })
          .then(hasRoles => {
            expect(hasRoles).to.be.true
            return modRole.getUsers()
              .add(user)
              .save()
              .then(() => parsm.userHasRole(user, {
                names: ['Administrator', 'Moderator'],
                op: 'and'
              }))
          })
          .then(hasRoles => {
            expect(hasRoles).to.be.true
            return parsm.userHasRole(user, {
              names: ['Administrator', 'Moderator'],
              op: 'or'
            })
          })
          .then(hasRoles => {
            expect(hasRoles).to.be.true
          })
    })
  
    it('reject when invalid "user" param', () => {
      return expect(parsm.userHasRole()).to.be.rejected
    })
    it('reject when invalid "roles" param', () => {
      return expect(parsm.userHasRole(user)).to.be.rejected
    })
  })

  describe('getRole', () => {
    it('returns Role object by name', () => {
      return parsm.getRole('Administrator')
        .then(role => {
          expect(parsm.isPFObject(role, 'Role')).to.be.true
        })
    })
  })

  describe('getUserRoles', () => {
    it('returns array of names of user\'s direct roles, or empty array if none', () => {
      const user = new Parse.User({
        username:'blastois',
        password:'je9w83d',
        email:'foo@bar.com'
      })
      return user.save()
        .then(aUser => {
          return parsm.getUserRoles(aUser)
            .then(roles => {
              expect(roles).to.be.an('array')
              expect(roles).to.have.lengthOf(0)
              return adminRole
                .getUsers()
                .add(aUser)
                .save()
                .then(() => parsm.getUserRoles(aUser))
                .then(roles => {
                  expect(roles.length).to.equal(1)
                  expect(roles[0]).to.equal("Administrator")
                })
            })
        })
    })
  })
  
})

describe('getClass', () => {
  it('returns a subclass of Parse.Object', () => {
    const cls = parsm.getClass('Colors')
    expect(typeof cls).to.equal('function')
    expect(cls.className === 'Colors').to.be.true
  })
})

describe('getClassInst', () => {
  it('returns an instance of a subclass of Parse.Object', () => {
    const inst = parsm.getClassInst('Colors')
    expect(typeof inst).to.equal('object')
    expect(inst.className === 'Colors').to.be.true
  })
  it('returns a subclass of Parse.Object with some attributes set', () => {
    const inst = parsm.getClassInst('Birds', {
      raven:{
        color:'black'
      },
      dove:{
        color:'white'
      }
    })
    expect(typeof inst).to.equal('object')
    expect(inst.className === 'Birds').to.be.true
    expect(inst.get('raven').color).to.equal('black')
    expect(inst.get('dove').color).to.equal('white')
  })
})

describe('Relationships', () => {
  
  describe('Many-to-Many with Join Tables', () => {

    describe('getJoinTableName', () => {
      it(`returns a name for a table used to join two other tables; format: <first table name>2<second table name>`, () => {
        expect(parsm.getJoinTableName('Employee','Company')).to.equal('Employee2Company')
      })
    })

    describe('joinWithTable', () => {
      const Ship = parsm.getClassInst('Ship')
      const Destroyer = parsm.getClassInst('Destroyer')
      const Fleet = parsm.getClassInst('Fleet')
      const origObjs = {}
      it(`creates a new class of object for joining two other classes`, () => {
        return Parse.Object.saveAll([Ship, Destroyer, Fleet])
          .then(savedObjs => {
            origObjs.Ship = savedObjs[0]
            origObjs.Destroyer = savedObjs[1]
            origObjs.Fleet = savedObjs[2]
            return parsm.joinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true
            expect(joinedShip.id).to.equal(origObjs.Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true
            expect(joinedFleet.id).to.equal(origObjs.Fleet.id)
          })
      })
      it(`creates a new class of object for joining two other classes with metadata describing their relationship`, () => {
        return parsm.joinWithTable({Destroyer:origObjs.Destroyer, Fleet:origObjs.Fleet}, {active:true})
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Destroyer2Fleet')).to.be.true
            expect(joinObj.get('active')).to.be.true
            const joinedDestroyer = joinObj.get('destroyer')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedDestroyer, 'Destroyer')).to.be.true
            expect(joinedDestroyer.id).to.equal(origObjs.Destroyer.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true
            expect(joinedFleet.id).to.equal(origObjs.Fleet.id)
          })
      })
    })

    describe('unJoinWithTable', () => {
      const Ship = parsm.getClassInst('Ship')
      const Fleet = parsm.getClassInst('Fleet')
      const origObjs = {}
      it(`removes document from a join table that points to two specific instances of Parse.Object`, () => {
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
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true
            // Further verify they are joined using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
              .first()
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true
            expect(joinedShip.id).to.equal(origObjs.Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true
            expect(joinedFleet.id).to.equal(origObjs.Fleet.id)
            // Un-join them by removing the document from the join table that points to both:
            return parsm.unJoinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
          })
          .then(joinObj => {
            // Should receive a copy of the join document that was destroyed:
            expect(joinObj).to.be.ok
            // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
              .first()
          })
          .then(joinObj => {
            expect(joinObj).to.not.be.ok
            // Verify that unJoinWithTable returns undefined when it cannot find
            return parsm.unJoinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet})
          })
          .then(joinObj => {
            expect(joinObj).to.not.be.ok
          })
    
      })
    })

    describe('getJoinQuery', () => {
      const Ship = parsm.getClassInst('Ship')
      const Fleet = parsm.getClassInst('Fleet')
      const origObjs = {}
      it(`returns a Parse.Query on a table that joins two subclasses of Parse.Object with pointers`, () => {
        // Create a couple of different objects:
        return Parse.Object.saveAll([Ship, Fleet])
          .then(savedObjs => {
            origObjs.Ship = savedObjs[0]
            origObjs.Fleet = savedObjs[1]
            // Join them with a third table and include some metadata:
            return parsm.joinWithTable({Ship: origObjs.Ship, Fleet: origObjs.Fleet}, {active:true, position:'flank'})
          })
          .then(joinObj => {
            // Verify existence of the new document in the join table:
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true
            // Further verify they are joined using parsimonious.getJoinQuery:
            return parsm.getJoinQuery({Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet')})
              .first()
          })
          .then(joinObj => {
            expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true
            const joinedShip = joinObj.get('ship')
            const joinedFleet = joinObj.get('fleet')
            expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true
            expect(joinedShip.id).to.equal(origObjs.Ship.id)
            expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true
            expect(joinedFleet.id).to.equal(origObjs.Fleet.id)
          })
      })
    })
    
  })
  
})

describe('isPFObject', () => {
  it('checks a valid Parse.Object', () => {
    expect(parsm.isPFObject(unsavedParseObj)).to.be.true
  })
  it('checks Parse.Object of a certain class', () => {
    expect(parsm.isPFObject(unsavedParseObj, 'TheParseObj')).to.be.true
  })
  it('ignores invalid "ofClass" parameter', () => {
    expect(parsm.isPFObject(unsavedParseObj, 3)).to.be.true
  })
  it('checks a special sub-class of Parse.Object, like "User"', () => {
    const user = new Parse.User({
      username:'chuck biff',
      password:'je9w83d',
      email:'chuck@bar.com'
    })
    return user.signUp()
      .then(aUser => {
        expect(parsm.isPFObject(aUser, 'User')).to.be.true
      })
  })
  it('returns false for pointer created locally as plain object', () => {
    expect(parsm.isPFObject({__type:'Pointer', className:'HairBall', objectId:'kjasoiuwne'})).to.equal(false)
  })
  it('returns false for pointer created with Parse.Object.toPointer', () => {
    expect(parsm.isPFObject(savedBouquets[0].toPointer())).to.equal(false)
  })
  it('returns true for Parse.Object subclass reference created with Parse.Object.createWithoutData', () => {
    expect(parsm.isPFObject(TheParseObj.createWithoutData('ihsd978h293'))).to.be.true
  })
})

describe('isPointer', () => {
  it('should return false for scalars', () => {
    expect(parsm.isPointer('Schnauser')).to.equal(false)
    expect(parsm.isPointer(1)).to.equal(false)
  })
  it('should return false for non-qualifying objects', () => {
    expect(parsm.isPointer(null)).to.equal(false)
    expect(parsm.isPointer(savedParseObj)).to.equal(false)
    expect(parsm.isPointer(parsm.toJsn(savedParseObj))).to.equal(false)
    expect(parsm.isPointer({__type:'Pointer',className:'HairBall'})).to.equal(false)
    expect(parsm.isPointer(TheParseObj.createWithoutData('ihsd978h293'))).to.equal(false)
  })
  it('should return true for qualifying objects', () => {
    expect(parsm.isPointer(savedParseObj.toPointer())).to.be.true
    expect(parsm.isPointer({className:'HairBall', objectId:'kjasoiuwne'})).to.be.true
    expect(parsm.isPointer(parsm.toJsn(savedParseObj.toPointer()))).to.be.true
    expect(parsm.isPointer(parsm.toJsn(savedParseObj.toPointer()))).to.be.true
  })
})

describe('getPFObjectClassName', () => {
  const user = new Parse.User({
    username:'foo manchu',
    password:'je9w83d',
    email:'foo@bar.com'
  })
  it('returns valid class-name of a subclass of Parse.Object without leading underscore', () => {
    expect(parsm.getPFObjectClassName(unsavedParseObj)).to.equal('TheParseObj')
    expect(parsm.getPFObjectClassName('User')).to.equal('User')
    expect(parsm.getPFObjectClassName('_User')).to.equal('User')
    expect(parsm.getPFObjectClassName(user)).to.equal('User')
    expect(parsm.getPFObjectClassName('_Session')).to.equal('Session')
    expect(parsm.getPFObjectClassName({naughty:'object'})).not.to.be.ok
    expect(parsm.getPFObjectClassName([1,2,3])).not.to.be.ok
  })
})

describe('isUser', () => {
  const user = new Parse.User()
  it('determines if an object created with new Parse.User(...) -- but not yet saved -- is an instance of Parse.User', () => {
    expect(parsm.isUser(user)).to.be.true
  })
  it('determines if the same object with some attributes set is an instance of Parse.User', () => {
    parsm.objSetMulti(user,
      {
        username:'chuck biff',
        password:'823980jdlksjd9',
        email:'chuck@wow.com'
      }
    )
    expect(parsm.isUser(user)).to.be.true
  })
  it('determines if an object created with new Parse.User(...) -- and then saved -- is an instance of Parse.User', () => {
    return user.signUp()
      .then(signedUpUser => {
        expect(parsm.isUser(signedUpUser)).to.be.true
      })
  })
  it('determines if a pointer to a User is a not an instance of Parse.User', () => {
    expect(parsm.isUser(user.toPointer())).to.equal(false)
  })
  it('determines if a object is a not an instance of Parse.User', () => {
    expect(parsm.isUser(unsavedParseObj)).to.equal(false)
  })
})

describe('getPointer', () => {
  it('returns a pointer to a custom class', () => {
    expect(parsm.getPointer('Horse', 'hsueji22')).to.eql({
      __type: 'Pointer',
      className: 'Horse',
      objectId: 'hsueji22'
    })
  })
  it('returns a pointer to a special class', () => {
    expect(parsm.getPointer('User', 'hsueji22')).to.eql({
      __type: 'Pointer',
      className: '_User',
      objectId: 'hsueji22'
    })
    expect(parsm.getPointer('Role', 'hsueji22')).to.eql({
      __type: 'Pointer',
      className: '_Role',
      objectId: 'hsueji22'
    })
  })
  it('throws error when passed invalid params', () => {
    expect(() => parsm.getPointer('Horse', 23)).to.throw('getPointer called with invalid parameters')
    expect(() => parsm.getPointer({hello:'there'}, 'asd')).to.throw('getPointer called with invalid parameters')
    expect(() => parsm.getPointer()).to.throw('getPointer called with invalid parameters')
  })
})

describe('classStringOrSpecialClass', () => {
  it('converts the unchanged string if not a special Parse class', () => {
    expect(parsm.classStringOrSpecialClass('Horse')).to.equal('Horse')
  })
  it('converts "User" to Parse.User', () => {
    expect(parsm.classStringOrSpecialClass('User')).to.equal(Parse.User)
  })
  it('converts "Session" to Parse.Session', () => {
    expect(parsm.classStringOrSpecialClass('Session')).to.equal(Parse.Session)
  })
  it('converts "Role" to Parse.Role', () => {
    expect(parsm.classStringOrSpecialClass('Role')).to.equal(Parse.Role)
  })
})
  
describe('_toArray', () => {
  
  const anArray = [5,3,'p']
  
  it('does not convert an array; just returns it', () => {
    expect(parsm._toArray(anArray)).to.equal(anArray)
  })
  
  it('converts a string to an array, splitting by commas if present', () => {
    expect(parsm._toArray('a,b,c')).to.eql(['a','b','c'])
  })
  
  it('converts any other type of value to an array with the value as the only item', () => {
    expect(parsm._toArray({hello:'there'})).to.eql([{hello:'there'}])
    expect(parsm._toArray(88)).to.eql([88])
  })
  
})