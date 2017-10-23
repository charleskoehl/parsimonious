'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; // 'use strict'

var _parseMockdb = require('parse-mockdb');

var _parseMockdb2 = _interopRequireDefault(_parseMockdb);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(require('chai-shallow-deep-equal'));
_chai2.default.use(require('chai-as-promised'));
var expect = _chai2.default.expect;

if ((typeof Parse === 'undefined' ? 'undefined' : _typeof(Parse)) === 'object') {
  console.log('using existing Parse');
} else if ((typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' && _typeof(global.Parse) === 'object') {
  console.log('using global.Parse');
} else if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && _typeof(window.Parse) === 'object') {
  var Parse = window.Parse;
  console.log('using window.Parse');
} else {
  console.log('using parse-shim');
  var Parse = require('parse-shim');
}
console.log('\n\n');

Parse.initialize('test');

var parsm = require('./Parsimonious')(Parse);

console.log('\n\n');
console.log('imported Parsmimonious');
console.log('\n\n');

var savedBouquets = void 0,
    TheParseObj = Parse.Object.extend('TheParseObj'),
    unsavedParseObj = new TheParseObj(),
    savedParseObj = void 0;

before(function () {
  _parseMockdb2.default.mockDB(); // Mock the Parse RESTController
  return unsavedParseObj.save({
    roses: 'red',
    violets: 'blue',
    grass: 'green'
  }).then(function (obj) {
    savedParseObj = obj;
    var ints = Array.from(Array(10).keys());
    var bouquetSaves = ints.map(function (n) {
      return parsm.getClassInst('Bouquet').save({ active: false, aNum: n });
    });
    return Parse.Promise.when(bouquetSaves).then(function (objs) {
      savedBouquets = objs;
      return objs;
    });
  });
});

after(function () {
  _parseMockdb2.default.cleanUp(); // Clear the Database
  _parseMockdb2.default.unMockDB(); // Un-mock the Parse RESTController
});

describe('toJsn', function () {
  it('returns the passed value when it is not a Parse object or a plain, non-null object', function () {
    var mySymbol = Symbol('test');
    expect(parsm.toJsn(mySymbol)).to.equal(mySymbol);
    expect(parsm.toJsn(undefined)).to.equal(undefined);
    expect(parsm.toJsn(null)).to.equal(null);
    expect(parsm.toJsn(true)).to.be.true;
    expect(parsm.toJsn(2)).to.equal(2);
    expect(parsm.toJsn('abc')).to.equal('abc');
  });
  it('returns a shallow JSON representation of a Parse object', function () {
    expect(parsm.toJsn(unsavedParseObj)).to.shallowDeepEqual({
      roses: 'red',
      violets: 'blue',
      grass: 'green'
    });
  });
  it('returns deep JSON representation of a plain object containing a plain, non-Parse object', function () {
    var plainObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      doohicky: {
        springs: 5,
        levers: 2
      }
    };
    expect(parsm.toJsn(plainObj, true)).to.shallowDeepEqual({
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      doohicky: {
        springs: 5,
        levers: 2
      }
    });
  });
  it('returns deep JSON representation of a plain object containing a Parse object', function () {
    var someObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: unsavedParseObj
    };
    expect(parsm.toJsn(someObj, true)).to.shallowDeepEqual({
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: {
        roses: 'red',
        violets: 'blue',
        grass: 'green'
      }
    });
  });
  it('returns deep JSON representation of a plain object containing a Parse object that has an objectId key', function () {
    unsavedParseObj.set('objectId', 'iei38s');
    var someObj = {
      foo: 'bar',
      domo: 'arigato',
      things: ['cow', 'pencil'],
      aParseObj: unsavedParseObj
    };
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
    });
  });
});

describe('objPick', function () {
  it('gets some columns from a Parse object and returns them in a plain object', function () {
    expect(parsm.objPick(unsavedParseObj, 'roses,grass')).to.eql({
      roses: 'red',
      grass: 'green'
    });
    expect(parsm.objPick(unsavedParseObj, ['roses', 'grass'])).to.eql({
      roses: 'red',
      grass: 'green'
    });
  });
});

describe('objGetDeep', function () {
  it('Get an an object-type column from a Parse object and return the value of a nested key within it', function () {
    var someObj = parsm.getClassInst('Company', {
      depts: {
        accounting: {
          employees: [{
            name: 'fred',
            height: 6.1
          }, {
            name: 'dan',
            height: 5.6
          }]
        },
        marketing: {
          employees: [{
            name: 'joe',
            height: 6.1
          }, {
            name: 'jane',
            height: 5.6
          }]
        }
      }
    });
    expect(someObj.get('depts')).to.be.an('object');
    expect(someObj.get('depts').accounting.employees[0].name).to.equal('fred');
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees[0].name')).to.equal('fred');
    expect(parsm.objGetDeep(someObj, 'depts.accounting.employees')).to.have.lengthOf(2);
  });
});

describe('objSetMulti', function () {
  it('sets some columns on a Parse object from a plain object', function () {
    parsm.objSetMulti(unsavedParseObj, {
      valley: 'big',
      river: 'deep'
    });
    expect(unsavedParseObj.get('river')).to.equal('deep');
  });
  it('sets some columns on a Parse object from a plain object, not merging sub-objects', function () {
    unsavedParseObj.set('ocean', {
      size: 'large',
      color: 'blue',
      denizens: 'fish'
    });
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size: 'medium',
        color: 'green'
      }
    });
    expect(unsavedParseObj.get('ocean')).to.shallowDeepEqual({
      size: 'medium',
      color: 'green'
    });
  });
  it('sets some columns on a Parse object from a plain object, merging sub-objects', function () {
    unsavedParseObj.set('ocean', {
      size: 'large',
      color: 'blue',
      denizens: 'fish'
    });
    parsm.objSetMulti(unsavedParseObj, {
      ocean: {
        size: 'medium',
        color: 'green'
      }
    }, true);
    expect(unsavedParseObj.get('ocean')).to.shallowDeepEqual({
      size: 'medium',
      color: 'green',
      denizens: 'fish'
    });
  });
});

describe('newQuery', function () {
  it('returns a query that finds all instances of a Parse class', function () {
    return parsm.newQuery('Bouquet').find().then(function (objs) {
      expect(objs).to.have.lengthOf(savedBouquets.length);
      expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true;
      expect(parsm.isPFObject(objs[9], 'Bouquet')).to.be.true;
      expect(objs[9].id).to.equal((parseInt(objs[0].id) + 9).toString());
    });
  });

  it('returns a query limited to first n instances of a Parse class', function () {
    return parsm.newQuery('Bouquet', { limit: 5 }).find().then(function (objs) {
      expect(objs).to.have.lengthOf(5);
      expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true;
      expect(parsm.isPFObject(objs[4], 'Bouquet')).to.be.true;
      expect(objs[4].id).to.equal((parseInt(objs[0].id) + 4).toString());
    });
  });
  it('returns a query skipping first n instances of a Parse class', function () {
    return parsm.newQuery('Bouquet', { skip: 5 }).find().then(function (objs) {
      expect(objs).to.have.lengthOf(5);
      expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true;
      expect(parsm.isPFObject(objs[4], 'Bouquet')).to.be.true;
      expect(objs[0].id).to.equal(savedBouquets[5].id);
      expect(objs[4].id).to.equal(savedBouquets[9].id);
    });
  });
  it('returns a query that selects only a certain column to be returned', function () {
    return parsm.newQuery('Bouquet', { select: 'aNum' }).find().then(function (objs) {
      expect(objs).to.have.lengthOf(10);
      expect(parsm.isPFObject(objs[0], 'Bouquet')).to.be.true;
      expect(parsm.isPFObject(objs[9], 'Bouquet')).to.be.true;
      expect(objs[0].id).to.equal(savedBouquets[0].id);
      expect(objs[9].id).to.equal(savedBouquets[9].id);
      expect(objs[6].get('aNum')).to.equal(6);
      // TODO parse-mockdb module does not seem to apply Parse.Query.select function, so next line fails:
      // expect(objs[6].get('active')).to.be.undefined
    });
  });
});

describe('getObjById', function () {
  it('gets a Parse object from db by id', function () {
    var aParseObj = new TheParseObj();
    var newObjId = void 0;
    return aParseObj.save({ roses: 'red' }).then(function (savedObj) {
      newObjId = savedObj.id;
      return parsm.getObjById('TheParseObj', newObjId);
    }).then(function (retrievedObj) {
      expect(parsm.isPFObject(retrievedObj)).to.be.true;
      expect(retrievedObj.id).to.equal(newObjId);
    });
  });
});

describe('getUserById', function () {
  it('gets a Parse user by id', function () {
    var user = new Parse.User({
      username: 'foo manchu',
      password: 'je9w83d',
      email: 'foo@bar.com'
    });
    return user.signUp().then(function (aUser) {
      return parsm.getUserById(aUser.id);
    }).then(function (aUser) {
      expect(parsm.isPFObject(aUser, 'User')).to.be.true;
    });
  });
});

describe('fetchIfNeeded, given a value <thing>, return a promise that resolves to', function () {
  it('thing if thing is a clean Parse.Object', function () {
    return parsm.fetchIfNeeded(savedBouquets[0]).then(function (result) {
      expect(result).to.equal(savedBouquets[0]);
    });
  });
  it('fetched Parse.Object if thing is a dirty Parse.Object', function () {
    savedBouquets[0].set('active', true);
    return parsm.fetchIfNeeded(savedBouquets[0]).then(function (result) {
      expect(result.get('active')).to.equal(false);
    });
  });
  it('fetched Parse.Object if thing is a pointer', function () {
    return parsm.fetchIfNeeded(savedBouquets[0].toPointer()).then(function (result) {
      expect(result).to.be.ok;
      expect(parsm.isPFObject(result)).to.be.true;
      expect(parsm.isPFObject(result, 'Bouquet')).to.be.true;
    });
  });
  it('thing if otherwise', function () {
    return expect(parsm.fetchIfNeeded('blah')).to.eventually.equal('blah');
  });
});

describe('Roles', function () {

  var roleACL = new Parse.ACL();
  roleACL.setPublicReadAccess(true);
  var adminRole = new Parse.Role("Administrator", roleACL);
  var modRole = new Parse.Role("Moderator", roleACL);

  describe('userHasRole', function () {

    var user = void 0;

    before(function () {
      return new Parse.User({
        username: 'foo manchu',
        password: 'je9w83d',
        email: 'foo@bar.com'
      }).signUp().then(function (aUser) {
        user = aUser;
      });
    });

    it('determines if a user has a single role', function () {
      return parsm.userHasRole(user, 'Administrator').then(function (hasRole) {
        expect(hasRole).to.equal(false);
        return adminRole.getUsers().add(user).save().then(function () {
          return parsm.userHasRole(user, 'Administrator');
        });
      }).then(function (hasRole) {
        expect(hasRole).to.be.true;
        return parsm.userHasRole(user, {
          names: ['Administrator', 'Moderator'],
          op: 'or'
        });
      }).then(function (hasRoles) {
        expect(hasRoles).to.be.true;
        return modRole.getUsers().add(user).save().then(function () {
          return parsm.userHasRole(user, {
            names: ['Administrator', 'Moderator'],
            op: 'and'
          });
        });
      }).then(function (hasRoles) {
        expect(hasRoles).to.be.true;
        return parsm.userHasRole(user, {
          names: ['Administrator', 'Moderator'],
          op: 'or'
        });
      }).then(function (hasRoles) {
        expect(hasRoles).to.be.true;
      });
    });

    it('reject when invalid "user" param', function () {
      return expect(parsm.userHasRole()).to.be.rejected;
    });
    it('reject when invalid "roles" param', function () {
      return expect(parsm.userHasRole(user)).to.be.rejected;
    });
  });

  describe('getRole', function () {
    it('returns Role object by name', function () {
      return parsm.getRole('Administrator').then(function (role) {
        expect(parsm.isPFObject(role, 'Role')).to.be.true;
      });
    });
  });

  describe('getUserRoles', function () {
    it('returns array of names of user\'s direct roles, or empty array if none', function () {
      var user = new Parse.User({
        username: 'blastois',
        password: 'je9w83d',
        email: 'foo@bar.com'
      });
      return user.save().then(function (aUser) {
        return parsm.getUserRoles(aUser).then(function (roles) {
          expect(roles).to.be.an('array');
          expect(roles).to.have.lengthOf(0);
          return adminRole.getUsers().add(aUser).save().then(function () {
            return parsm.getUserRoles(aUser);
          }).then(function (roles) {
            expect(roles.length).to.equal(1);
            expect(roles[0]).to.equal("Administrator");
          });
        });
      });
    });
  });
});

describe('getClass', function () {
  it('returns a subclass of Parse.Object', function () {
    var cls = parsm.getClass('Colors');
    expect(typeof cls === 'undefined' ? 'undefined' : _typeof(cls)).to.equal('function');
    expect(cls.className === 'Colors').to.be.true;
  });
});

describe('getClassInst', function () {
  it('returns an instance of a subclass of Parse.Object', function () {
    var inst = parsm.getClassInst('Colors');
    expect(typeof inst === 'undefined' ? 'undefined' : _typeof(inst)).to.equal('object');
    expect(inst.className === 'Colors').to.be.true;
  });
  it('returns a subclass of Parse.Object with some attributes set', function () {
    var inst = parsm.getClassInst('Birds', {
      raven: {
        color: 'black'
      },
      dove: {
        color: 'white'
      }
    });
    expect(typeof inst === 'undefined' ? 'undefined' : _typeof(inst)).to.equal('object');
    expect(inst.className === 'Birds').to.be.true;
    expect(inst.get('raven').color).to.equal('black');
    expect(inst.get('dove').color).to.equal('white');
  });
});

describe('Relationships', function () {

  describe('Many-to-Many with Join Tables', function () {

    describe('getJoinTableName', function () {
      it('returns a name for a table used to join two other tables; format: <first table name>2<second table name>', function () {
        expect(parsm.getJoinTableName('Employee', 'Company')).to.equal('Employee2Company');
      });
    });

    describe('joinWithTable', function () {
      var Ship = parsm.getClassInst('Ship');
      var Destroyer = parsm.getClassInst('Destroyer');
      var Fleet = parsm.getClassInst('Fleet');
      var origObjs = {};
      it('creates a new class of object for joining two other classes', function () {
        return Parse.Object.saveAll([Ship, Destroyer, Fleet]).then(function (savedObjs) {
          origObjs.Ship = savedObjs[0];
          origObjs.Destroyer = savedObjs[1];
          origObjs.Fleet = savedObjs[2];
          return parsm.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
        }).then(function (joinObj) {
          expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true;
          var joinedShip = joinObj.get('ship');
          var joinedFleet = joinObj.get('fleet');
          expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true;
          expect(joinedShip.id).to.equal(origObjs.Ship.id);
          expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true;
          expect(joinedFleet.id).to.equal(origObjs.Fleet.id);
        });
      });
      it('creates a new class of object for joining two other classes with metadata describing their relationship', function () {
        return parsm.joinWithTable({ Destroyer: origObjs.Destroyer, Fleet: origObjs.Fleet }, { active: true }).then(function (joinObj) {
          expect(parsm.isPFObject(joinObj, 'Destroyer2Fleet')).to.be.true;
          expect(joinObj.get('active')).to.be.true;
          var joinedDestroyer = joinObj.get('destroyer');
          var joinedFleet = joinObj.get('fleet');
          expect(parsm.isPFObject(joinedDestroyer, 'Destroyer')).to.be.true;
          expect(joinedDestroyer.id).to.equal(origObjs.Destroyer.id);
          expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true;
          expect(joinedFleet.id).to.equal(origObjs.Fleet.id);
        });
      });
    });

    describe('unJoinWithTable', function () {
      var Ship = parsm.getClassInst('Ship');
      var Fleet = parsm.getClassInst('Fleet');
      var origObjs = {};
      it('removes document from a join table that points to two specific instances of Parse.Object', function () {
        // Create a couple of different objects:
        return Parse.Object.saveAll([Ship, Fleet]).then(function (savedObjs) {
          origObjs.Ship = savedObjs[0];
          origObjs.Fleet = savedObjs[1];
          // Join them with a third table:
          return parsm.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
        }).then(function (joinObj) {
          // Verify existence of the new document in the join table:
          expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true;
          // Further verify they are joined using parsimonious.getJoinQuery:
          return parsm.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
        }).then(function (joinObj) {
          expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true;
          var joinedShip = joinObj.get('ship');
          var joinedFleet = joinObj.get('fleet');
          expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true;
          expect(joinedShip.id).to.equal(origObjs.Ship.id);
          expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true;
          expect(joinedFleet.id).to.equal(origObjs.Fleet.id);
          // Un-join them by removing the document from the join table that points to both:
          return parsm.unJoinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
        }).then(function (joinObj) {
          // Should receive a copy of the join document that was destroyed:
          expect(joinObj).to.be.ok;
          // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
          return parsm.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
        }).then(function (joinObj) {
          expect(joinObj).to.not.be.ok;
          // Verify that unJoinWithTable returns undefined when it cannot find
          return parsm.unJoinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
        }).then(function (joinObj) {
          expect(joinObj).to.not.be.ok;
        });
      });
    });

    describe('getJoinQuery', function () {
      var Ship = parsm.getClassInst('Ship');
      var Fleet = parsm.getClassInst('Fleet');
      var origObjs = {};
      it('returns a Parse.Query on a table that joins two subclasses of Parse.Object with pointers', function () {
        // Create a couple of different objects:
        return Parse.Object.saveAll([Ship, Fleet]).then(function (savedObjs) {
          origObjs.Ship = savedObjs[0];
          origObjs.Fleet = savedObjs[1];
          // Join them with a third table and include some metadata:
          return parsm.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet }, { active: true, position: 'flank' });
        }).then(function (joinObj) {
          // Verify existence of the new document in the join table:
          expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true;
          // Further verify they are joined using parsimonious.getJoinQuery:
          return parsm.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
        }).then(function (joinObj) {
          expect(parsm.isPFObject(joinObj, 'Ship2Fleet')).to.be.true;
          var joinedShip = joinObj.get('ship');
          var joinedFleet = joinObj.get('fleet');
          expect(parsm.isPFObject(joinedShip, 'Ship')).to.be.true;
          expect(joinedShip.id).to.equal(origObjs.Ship.id);
          expect(parsm.isPFObject(joinedFleet, 'Fleet')).to.be.true;
          expect(joinedFleet.id).to.equal(origObjs.Fleet.id);
        });
      });
    });
  });
});

describe('isPFObject', function () {
  it('checks a valid Parse.Object', function () {
    expect(parsm.isPFObject(unsavedParseObj)).to.be.true;
  });
  it('checks Parse.Object of a certain class', function () {
    expect(parsm.isPFObject(unsavedParseObj, 'TheParseObj')).to.be.true;
  });
  it('ignores invalid "ofClass" parameter', function () {
    expect(parsm.isPFObject(unsavedParseObj, 3)).to.be.true;
  });
  it('checks a special sub-class of Parse.Object, like "User"', function () {
    var user = new Parse.User({
      username: 'chuck biff',
      password: 'je9w83d',
      email: 'chuck@bar.com'
    });
    return user.signUp().then(function (aUser) {
      expect(parsm.isPFObject(aUser, 'User')).to.be.true;
    });
  });
  it('returns false for pointer created locally as plain object', function () {
    expect(parsm.isPFObject({ __type: 'Pointer', className: 'HairBall', objectId: 'kjasoiuwne' })).to.equal(false);
  });
  it('returns false for pointer created with Parse.Object.toPointer', function () {
    expect(parsm.isPFObject(savedBouquets[0].toPointer())).to.equal(false);
  });
  it('returns true for Parse.Object subclass reference created with Parse.Object.createWithoutData', function () {
    expect(parsm.isPFObject(TheParseObj.createWithoutData('ihsd978h293'))).to.be.true;
  });
});

describe('isPointer', function () {
  it('should return false for scalars', function () {
    expect(parsm.isPointer('Schnauser')).to.equal(false);
    expect(parsm.isPointer(1)).to.equal(false);
  });
  it('should return false for non-qualifying objects', function () {
    expect(parsm.isPointer(null)).to.equal(false);
    expect(parsm.isPointer(savedParseObj)).to.equal(false);
    expect(parsm.isPointer(parsm.toJsn(savedParseObj))).to.equal(false);
    expect(parsm.isPointer({ __type: 'Pointer', className: 'HairBall' })).to.equal(false);
    expect(parsm.isPointer(TheParseObj.createWithoutData('ihsd978h293'))).to.equal(false);
  });
  it('should return true for qualifying objects', function () {
    expect(parsm.isPointer(savedParseObj.toPointer())).to.be.true;
    expect(parsm.isPointer({ className: 'HairBall', objectId: 'kjasoiuwne' })).to.be.true;
    expect(parsm.isPointer(parsm.toJsn(savedParseObj.toPointer()))).to.be.true;
    expect(parsm.isPointer(parsm.toJsn(savedParseObj.toPointer()))).to.be.true;
  });
});

describe('getPFObjectClassName', function () {
  var user = new Parse.User({
    username: 'foo manchu',
    password: 'je9w83d',
    email: 'foo@bar.com'
  });
  it('returns valid class-name of a subclass of Parse.Object without leading underscore', function () {
    expect(parsm.getPFObjectClassName(unsavedParseObj)).to.equal('TheParseObj');
    expect(parsm.getPFObjectClassName('User')).to.equal('User');
    expect(parsm.getPFObjectClassName('_User')).to.equal('User');
    expect(parsm.getPFObjectClassName(user)).to.equal('User');
    expect(parsm.getPFObjectClassName('_Session')).to.equal('Session');
    expect(parsm.getPFObjectClassName({ naughty: 'object' })).not.to.be.ok;
    expect(parsm.getPFObjectClassName([1, 2, 3])).not.to.be.ok;
  });
});

describe('isUser', function () {
  var user = new Parse.User();
  it('determines if an object created with new Parse.User(...) -- but not yet saved -- is an instance of Parse.User', function () {
    expect(parsm.isUser(user)).to.be.true;
  });
  it('determines if the same object with some attributes set is an instance of Parse.User', function () {
    parsm.objSetMulti(user, {
      username: 'chuck biff',
      password: '823980jdlksjd9',
      email: 'chuck@wow.com'
    });
    expect(parsm.isUser(user)).to.be.true;
  });
  it('determines if an object created with new Parse.User(...) -- and then saved -- is an instance of Parse.User', function () {
    return expect(user.signUp().then(parsm.isUser)).to.eventually.equal(true);
  });
  it('determines if a pointer to a User is a not an instance of Parse.User', function () {
    expect(parsm.isUser(user.toPointer())).to.equal(false);
  });
  it('determines if a object is a not an instance of Parse.User', function () {
    expect(parsm.isUser(unsavedParseObj)).to.equal(false);
  });
});

describe('classStringOrSpecialClass', function () {
  it('converts the unchanged string if not a special Parse class', function () {
    expect(parsm.classStringOrSpecialClass('Horse')).to.equal('Horse');
  });
  it('converts "User" to Parse.User', function () {
    expect(parsm.classStringOrSpecialClass('User')).to.equal(Parse.User);
  });
  it('converts "Session" to Parse.Session', function () {
    expect(parsm.classStringOrSpecialClass('Session')).to.equal(Parse.Session);
  });
  it('converts "Role" to Parse.Role', function () {
    expect(parsm.classStringOrSpecialClass('Role')).to.equal(Parse.Role);
  });
});

describe('_toArray', function () {

  var anArray = [5, 3, 'p'];

  it('does not convert an array; just returns it', function () {
    expect(parsm._toArray(anArray)).to.equal(anArray);
  });

  it('converts a string to an array, splitting by commas if present', function () {
    expect(parsm._toArray('a,b,c')).to.eql(['a', 'b', 'c']);
  });

  it('converts any other type of value to an array with the value as the only item', function () {
    expect(parsm._toArray({ hello: 'there' })).to.eql([{ hello: 'there' }]);
    expect(parsm._toArray(88)).to.eql([88]);
  });
});