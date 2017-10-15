'use strict';

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _parseMockdb = require('parse-mockdb');

var _parseMockdb2 = _interopRequireDefault(_parseMockdb);

var _node3 = require('./node');

var _node4 = _interopRequireDefault(_node3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_node2.default.initialize('test');

var savedBouquets;

beforeAll(function () {
  _parseMockdb2.default.mockDB(); // Mock the Parse RESTController
  var bouquets = [];
  for (var i = 0; i < 10; i++) {
    bouquets.push(_node4.default.getClassInst('Bouquet'));
  }
  return _node2.default.Object.saveAll(bouquets).then(function (objs) {
    savedBouquets = objs;
  });
});

afterAll(function () {
  _parseMockdb2.default.cleanUp(); // Clear the Database
  _parseMockdb2.default.unMockDB(); // Un-mock the Parse RESTController
});

var TheParseObj = _node2.default.Object.extend('TheParseObj');
var aParseObj = new TheParseObj();
aParseObj.set('roses', 'red');
aParseObj.set('violets', 'blue');
aParseObj.set('grass', 'green');

describe('parsimonious methods', function () {

  describe('toJsn', function () {
    test('returns the input when input is not a Parse object or a plain, non-null object', function () {
      var mySymbol = Symbol('test');
      expect(_node4.default.toJsn(mySymbol)).toEqual(mySymbol);
      expect(_node4.default.toJsn(undefined)).toEqual(undefined);
      expect(_node4.default.toJsn(null)).toEqual(null);
      expect(_node4.default.toJsn(true)).toEqual(true);
      expect(_node4.default.toJsn(2)).toEqual(2);
      expect(_node4.default.toJsn('abc')).toEqual('abc');
    });
    test('returns a shallow JSON representation of a Parse object', function () {
      expect(_node4.default.toJsn(aParseObj)).toBeEquivalentObject({
        roses: 'red',
        violets: 'blue',
        grass: 'green'
      });
    });
    test('returns deep JSON representation of a plain object containing a plain, non-Parse object', function () {
      var plainObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        doohicky: {
          springs: 5,
          levers: 2
        }
      };
      expect(_node4.default.toJsn(plainObj, true)).toBeEquivalentObject({
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        doohicky: {
          springs: 5,
          levers: 2
        }
      });
    });
    test('returns deep JSON representation of a plain object containing a Parse object', function () {
      var someObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj: aParseObj
      };
      expect(_node4.default.toJsn(someObj, true)).toBeEquivalentObject({
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
    test('returns deep JSON representation of a plain object containing a Parse object that has an objectId key', function () {
      aParseObj.set('objectId', 'iei38s');
      var someObj = {
        foo: 'bar',
        domo: 'arigato',
        things: ['cow', 'pencil'],
        aParseObj: aParseObj
      };
      expect(_node4.default.toJsn(someObj, true)).toBeEquivalentObject({
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
    test('gets some columns from a Parse object and returns them in a plain object', function () {
      expect(_node4.default.objPick(aParseObj, 'roses,grass')).toEqual({
        roses: 'red',
        grass: 'green'
      });
      expect(_node4.default.objPick(aParseObj, ['roses', 'grass'])).toEqual({
        roses: 'red',
        grass: 'green'
      });
    });
  });

  describe('objSetMulti', function () {
    test('sets some columns on a Parse object from a plain object', function () {
      _node4.default.objSetMulti(aParseObj, {
        valley: 'big',
        river: 'deep'
      });
      expect(aParseObj.get('river')).toBe('deep');
    });
    test('sets some columns on a Parse object from a plain object, not merging sub-objects', function () {
      aParseObj.set('ocean', {
        size: 'large',
        color: 'blue',
        denizens: 'fish'
      });
      _node4.default.objSetMulti(aParseObj, {
        ocean: {
          size: 'medium',
          color: 'green'
        }
      });
      expect(aParseObj.get('ocean')).toBeEquivalentObject({
        size: 'medium',
        color: 'green'
      });
    });
    test('sets some columns on a Parse object from a plain object, merging sub-objects', function () {
      aParseObj.set('ocean', {
        size: 'large',
        color: 'blue',
        denizens: 'fish'
      });
      _node4.default.objSetMulti(aParseObj, {
        ocean: {
          size: 'medium',
          color: 'green'
        }
      }, true);
      expect(aParseObj.get('ocean')).toBeEquivalentObject({
        size: 'medium',
        color: 'green',
        denizens: 'fish'
      });
    });
  });

  describe('newQuery', function () {
    test('returns a query that finds all instances of a Parse class', function () {
      expect.assertions(4);
      return _node4.default.newQuery('Bouquet').find().then(function (objs) {
        expect(objs).toHaveLength(savedBouquets.length);
        expect(_node4.default.isPFObject(objs[0], 'Bouquet')).toBe(true);
        expect(_node4.default.isPFObject(objs[9], 'Bouquet')).toBe(true);
        expect(objs[9].id).toBe((parseInt(objs[0].id) + 9).toString());
      });
    });
    test('returns a query limited to first n instances of a Parse class', function () {
      expect.assertions(4);
      return _node4.default.newQuery('Bouquet', { limit: 5 }).find().then(function (objs) {
        expect(objs).toHaveLength(5);
        expect(_node4.default.isPFObject(objs[0], 'Bouquet')).toBe(true);
        expect(_node4.default.isPFObject(objs[4], 'Bouquet')).toBe(true);
        expect(objs[4].id).toBe((parseInt(objs[0].id) + 4).toString());
      });
    });
    test('returns a query skipping first n instances of a Parse class', function () {
      expect.assertions(5);
      return _node4.default.newQuery('Bouquet', { skip: 5 }).find().then(function (objs) {
        expect(objs).toHaveLength(5);
        expect(_node4.default.isPFObject(objs[0], 'Bouquet')).toBe(true);
        expect(_node4.default.isPFObject(objs[4], 'Bouquet')).toBe(true);
        expect(objs[0].id).toBe(savedBouquets[5].id);
        expect(objs[4].id).toBe(savedBouquets[9].id);
      });
    });
  });

  describe('getObjById', function () {
    test('gets a Parse object from db by id', function () {
      expect.assertions(2);
      var aParseObj = new TheParseObj();
      var newObjId = void 0;
      return aParseObj.save({ roses: 'red' }).then(function (savedObj) {
        newObjId = savedObj.id;
        return _node4.default.getObjById('TheParseObj', newObjId);
      }).then(function (retrievedObj) {
        expect(_node4.default.isPFObject(retrievedObj)).toBe(true);
        expect(retrievedObj.id).toBe(newObjId);
      });
    });
  });

  describe('getUserById', function () {
    test('gets a Parse user by id', function () {
      expect.assertions(1);
      var user = new _node2.default.User({
        username: 'foo manchu',
        password: 'je9w83d',
        email: 'foo@bar.com'
      });
      return user.signUp().then(function (aUser) {
        return _node4.default.getUserById(aUser.id);
      }).then(function (aUser) {
        expect(_node4.default.isPFObject(aUser, 'User')).toBe(true);
      });
    });
  });

  describe('Roles', function () {

    var roleACL = new _node2.default.ACL();
    roleACL.setPublicReadAccess(true);
    var adminRole = new _node2.default.Role("Administrator", roleACL);
    var modRole = new _node2.default.Role("Moderator", roleACL);

    describe('userHasRole', function () {
      test('determines if a user has a single role', function () {
        expect.assertions(4);
        var user = new _node2.default.User({
          username: 'foo manchu',
          password: 'je9w83d',
          email: 'foo@bar.com'
        });
        return user.signUp().then(function (aUser) {
          return _node4.default.userHasRole(aUser, 'Administrator').then(function (hasRole) {
            expect(hasRole).toBe(false);
            return adminRole.getUsers().add(aUser).save().then(function () {
              return _node4.default.userHasRole(aUser, 'Administrator');
            });
          }).then(function (hasRole) {
            expect(hasRole).toBe(true);
            return modRole.getUsers().add(aUser).save().then(function () {
              return _node4.default.userHasRole(aUser, {
                names: ['Administrator', 'Moderator'],
                op: 'and'
              });
            });
          }).then(function (hasRoles) {
            expect(hasRoles).toBe(true);
            return _node4.default.userHasRole(aUser, {
              names: ['Administrator', 'Moderator'],
              op: 'or'
            });
          }).then(function (hasRoles) {
            expect(hasRoles).toBe(true);
          });
        });
      });
    });

    describe('getRole', function () {
      test('returns Role object by name', function () {
        expect.assertions(1);
        return _node4.default.getRole('Administrator').then(function (role) {
          expect(_node4.default.isPFObject(role, 'Role')).toBe(true);
        });
      });
    });

    describe('getUserRoles', function () {
      test('returns array of names of user\'s direct roles, or empty array if none', function () {
        expect.assertions(3);
        var user = new _node2.default.User({
          username: 'blastois',
          password: 'je9w83d',
          email: 'foo@bar.com'
        });
        return user.save().then(function (aUser) {
          return _node4.default.getUserRoles(aUser).then(function (roles) {
            expect(roles).toEqual([]);
            return adminRole.getUsers().add(aUser).save().then(function () {
              return _node4.default.getUserRoles(aUser);
            }).then(function (roles) {
              expect(roles.length).toBe(1);
              expect(roles[0]).toBe("Administrator");
            });
          });
        });
      });
    });
  });

  describe('getClassInst', function () {
    test('returns a subclass of Parse.Object', function () {
      var inst = _node4.default.getClassInst('Colors');
      expect(inst.className === 'Colors').toBe(true);
    });
    test('returns a subclass of Parse.Object with some attributes set', function () {
      var inst = _node4.default.getClassInst('Birds', {
        raven: {
          color: 'black'
        },
        dove: {
          color: 'white'
        }
      });
      expect(inst.className === 'Birds').toBe(true);
      expect(inst.get('raven').color).toBe('black');
      expect(inst.get('dove').color).toBe('white');
    });
  });

  describe('Relationships', function () {

    describe('Many-to-Many with Join Tables', function () {

      describe('getJoinTableName', function () {
        test('returns a name for a table used to join two other tables; format: <first table name>2<second table name>', function () {
          expect(_node4.default.getJoinTableName('Employee', 'Company')).toBe('Employee2Company');
        });
      });

      describe('joinWithTable', function () {
        var Ship = _node4.default.getClassInst('Ship');
        var Destroyer = _node4.default.getClassInst('Destroyer');
        var Fleet = _node4.default.getClassInst('Fleet');
        var origObjs = {};
        test('creates a new class of object for joining two other classes', function () {
          expect.assertions(5);
          return _node2.default.Object.saveAll([Ship, Destroyer, Fleet]).then(function (savedObjs) {
            origObjs.Ship = savedObjs[0];
            origObjs.Destroyer = savedObjs[1];
            origObjs.Fleet = savedObjs[2];
            return _node4.default.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
          }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            var joinedShip = joinObj.get('ship');
            var joinedFleet = joinObj.get('fleet');
            expect(_node4.default.isPFObject(joinedShip, 'Ship')).toBe(true);
            expect(joinedShip.id).toEqual(origObjs.Ship.id);
            expect(_node4.default.isPFObject(joinedFleet, 'Fleet')).toBe(true);
            expect(joinedFleet.id).toEqual(origObjs.Fleet.id);
          });
        });
        test('creates a new class of object for joining two other classes with metadata describing their relationship', function () {
          expect.assertions(6);
          return _node4.default.joinWithTable({ Destroyer: origObjs.Destroyer, Fleet: origObjs.Fleet }, { active: true }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Destroyer2Fleet')).toBe(true);
            expect(joinObj.get('active')).toBe(true);
            var joinedDestroyer = joinObj.get('destroyer');
            var joinedFleet = joinObj.get('fleet');
            expect(_node4.default.isPFObject(joinedDestroyer, 'Destroyer')).toBe(true);
            expect(joinedDestroyer.id).toEqual(origObjs.Destroyer.id);
            expect(_node4.default.isPFObject(joinedFleet, 'Fleet')).toBe(true);
            expect(joinedFleet.id).toEqual(origObjs.Fleet.id);
          });
        });
      });

      describe('unJoinWithTable', function () {
        var Ship = _node4.default.getClassInst('Ship');
        var Fleet = _node4.default.getClassInst('Fleet');
        var origObjs = {};
        test('removes document from a join table that points to two specific instances of Parse.Object', function () {
          expect.assertions(9);
          // Create a couple of different objects:
          return _node2.default.Object.saveAll([Ship, Fleet]).then(function (savedObjs) {
            origObjs.Ship = savedObjs[0];
            origObjs.Fleet = savedObjs[1];
            // Join them with a third table:
            return _node4.default.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
          }).then(function (joinObj) {
            // Verify existence of the new document in the join table:
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            // Further verify they are joined using parsimonious.getJoinQuery:
            return _node4.default.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
          }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            var joinedShip = joinObj.get('ship');
            var joinedFleet = joinObj.get('fleet');
            expect(_node4.default.isPFObject(joinedShip, 'Ship')).toBe(true);
            expect(joinedShip.id).toEqual(origObjs.Ship.id);
            expect(_node4.default.isPFObject(joinedFleet, 'Fleet')).toBe(true);
            expect(joinedFleet.id).toEqual(origObjs.Fleet.id);
            // Un-join them by removing the document from the join table that points to both:
            return _node4.default.unJoinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
          }).then(function (joinObj) {
            // Should receive a copy of the join document that was destroyed:
            expect(joinObj).toBeDefined();
            // Further verify the document was really destroyed by using parsimonious.getJoinQuery:
            return _node4.default.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
          }).then(function (joinObj) {
            expect(joinObj).toBeUndefined();
            // Verify that unJoinWithTable returns undefined when it cannot find
            return _node4.default.unJoinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet });
          }).then(function (joinObj) {
            expect(joinObj).toBeUndefined();
          });
        });
      });

      describe('getJoinQuery', function () {
        var Ship = _node4.default.getClassInst('Ship');
        var Fleet = _node4.default.getClassInst('Fleet');
        var origObjs = {};
        test('returns a Parse.Query on a table that joins two subclasses of Parse.Object with pointers', function () {
          expect.assertions(10);
          // Create a couple of different objects:
          return _node2.default.Object.saveAll([Ship, Fleet]).then(function (savedObjs) {
            origObjs.Ship = savedObjs[0];
            origObjs.Fleet = savedObjs[1];
            // Join them with a third table and include some metadata so we can test the 'select' parameter later:
            return _node4.default.joinWithTable({ Ship: origObjs.Ship, Fleet: origObjs.Fleet }, { active: true, position: 'flank' });
          }).then(function (joinObj) {
            // Verify existence of the new document in the join table:
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            // Further verify they are joined using parsimonious.getJoinQuery:
            return _node4.default.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }).first();
          }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            var joinedShip = joinObj.get('ship');
            var joinedFleet = joinObj.get('fleet');
            expect(_node4.default.isPFObject(joinedShip, 'Ship')).toBe(true);
            expect(joinedShip.id).toEqual(origObjs.Ship.id);
            expect(_node4.default.isPFObject(joinedFleet, 'Fleet')).toBe(true);
            expect(joinedFleet.id).toEqual(origObjs.Fleet.id);
            // Test 'select' parameter
            return _node4.default.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }, { select: 'active' }).first();
          }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            expect(joinObj.get('active')).toBe(true);
            // TODO I can't get query.select to work. It might be parse-mockdb. expect(joinObj.get('position')).toBeUndefined()
            return _node4.default.getJoinQuery({ Ship: joinObj.get('ship'), Fleet: joinObj.get('fleet') }, { select: ['position'] }).first();
          }).then(function (joinObj) {
            expect(_node4.default.isPFObject(joinObj, 'Ship2Fleet')).toBe(true);
            expect(joinObj.get('position')).toBe('flank');
            // TODO I can't get query.select to work. It might be parse-mockdb. expect(joinObj.get('position')).toBeUndefined()
          });
        });
      });
    });
  });

  describe('isPFObject', function () {
    test('determines if a variable is a Parse.Object', function () {
      expect(_node4.default.isPFObject(aParseObj)).toBe(true);
    });
    test('determines if a variable is a Parse.Object of a certain class', function () {
      expect(_node4.default.isPFObject(aParseObj, 'TheParseObj')).toBe(true);
    });
    test('determines if a variable is an instance of a special sub-class of Parse.Object', function () {
      expect.assertions(1);
      var user = new _node2.default.User({
        username: 'chuck biff',
        password: 'je9w83d',
        email: 'chuck@bar.com'
      });
      return user.signUp().then(function (aUser) {
        expect(_node4.default.isPFObject(aUser, 'User')).toBe(true);
      });
    });
    test('ignores invalid "ofClass" parameter', function () {
      expect(_node4.default.isPFObject(aParseObj, 3)).toBe(true);
    });
  });

  describe('isUser', function () {
    test('determines if a variable is a Parse.User', function () {
      expect.assertions(1);
      var user = new _node2.default.User({
        username: 'chuck biff',
        password: '823980jdlksjd9',
        email: 'chuck@wow.com'
      });
      return user.signUp().then(function (aUser) {
        expect(_node4.default.isUser(aUser)).toBe(true);
      });
    });
    test('determines if a variable is a not a Parse.User', function () {
      expect(_node4.default.isUser(aParseObj)).toBe(false);
    });
  });
});