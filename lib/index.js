/**
 * Utilities for Parse Server cloud code and JS SDK.
 * @class Parsimonious
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

var _lowerFirst = require('lodash/lowerFirst');

var _lowerFirst2 = _interopRequireDefault(_lowerFirst);

var _intersection = require('lodash/intersection');

var _intersection2 = _interopRequireDefault(_intersection);

var _detectIsNode = require('detect-is-node');

var _detectIsNode2 = _interopRequireDefault(_detectIsNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var specialClasses = ['User', 'Role', 'Session'];

var Parsimonious = function () {
  function Parsimonious() {
    _classCallCheck(this, Parsimonious);
  }

  _createClass(Parsimonious, null, [{
    key: 'setParse',


    /**
     * Set the instance of the Parse JS SDK to be used by all methods:
     * @param {object} parse instance of the Parse JS SDK
     */
    value: function setParse(parse) {
      if ((typeof parse === 'undefined' ? 'undefined' : _typeof(parse)) === 'object' && typeof parse.ACL === 'function') {
        this.Parse = parse;
        this.rej = this.Parse.Promise.reject;
      } else {
        throw new TypeError('non-object passed as Parse object');
      }
    }

    /* CLASSES / INSTANCES */

    /**
     * Short-hand for Parse.Object.extend(className) or a special class like Parse.User
     * @param {string} className
     * @returns subclass of Parse.Object
     */

  }, {
    key: 'getClass',
    value: function getClass(className) {
      if (typeof className === 'string') {
        return specialClasses.indexOf(className) !== -1 ? this.Parse[className] : this.Parse.Object.extend(className);
      } else {
        throw new TypeError('getClass called with ' + (typeof className === 'undefined' ? 'undefined' : _typeof(className)) + ' instead of string');
      }
    }

    /**
     * Return instance of Parse.Object class.
     * @param {string} className Parse.Object subclass name.
     * @param {object=} attributes Properties to set on new object.
     * @param {object=} options Options to use when creating object.
     * @returns {Parse.Object}
     */

  }, {
    key: 'getClassInst',
    value: function getClassInst(className, attributes, options) {
      var Cls = this.getClass(className);
      return new Cls(attributes, options);
    }

    /* QUERIES */

    /**
     * Returns a new Parse.Query instance from a Parse Object class name.
     * @example
     * // Generate a new Parse.Query on the User class,
     *
     * const query = Parsimonious.newQuery('User')
     *
     * // which is equivalent to:
     *
     * const query = new Parse.Query(Parse.User)
     * @example
     * // Generate a new Parse.Query on a custom class,
     *
     * const query = Parsimonious.newQuery('Company')
     *
     * // which is equivalent to:
     *
     * const Company = Parse.Object.extend('Company')
     * const query = new Parse.Query(Company)
     * @example
     * // Generate a new Parse.Query on the User class, adding constraints 'startsWith,' 'limit,' and 'select.' (See Parsimonious.constrainQuery for constraints parameter details.)
     *
     * const query = Parsimonious.newQuery('Company', {
     *   startsWith: ['name', 'tar'],
     *   limit: 10, // If there is only one argument, does not need to be in an array
     *   select: [ ['name', 'address', 'url'] ] // If any argument for a constraint is an array, it must be passed to constrainQuery within another array to indicate that its array items are not individual arguments.
     * })
     *
     * // which is equivalent to:
     *
     * const Company = Parse.Object.extend('Company')
     * const query = new Parse.Query(Company)
     * query.startsWith('name', 'tar')
     * query.limit(10)
     * query.select('name')
     * query.select('address')
     * query.select('url')
     * @param {(Parse.Object|string)} aClass Parse class instance or name
     * @param {object=} constraints Plain object whose keys may be any Parse.Query constraint methods and whose values are arrays of arguments for those methods.
     * @returns {Parse.Query}
     */

  }, {
    key: 'newQuery',
    value: function newQuery(aClass, constraints) {
      var clsInst = this.isPFObject(aClass) ? aClass : this.getClassInst(aClass);
      var query = new this.Parse.Query(clsInst);
      constraints && this.constrainQuery(query, constraints);
      return query;
    }

    /**
     * Calls one or more query constraint methods on a query with arbitrary number of arguments for each method.
     * This method is useful when, for example, building a complex query configuration to pass to another function that may modify the configuration further and then generate the actual query.
     * Mutates the 'query' parameter because it calls constraint methods on it.
     * Returns the query, so you can chain this call.
     * @example
     * // Modify a query with startsWith, limit, select, equalTo, and notEqualTo constraints:
     *
     * const query = Parsimonious.newQuery('User')
     * const constraints = {
     *   startsWith: ['name', 'Sal'],
     *   limit: 10, // If there is only one argument, does not need to be in an array
     *   select: [ ['name', 'email', 'birthDate'] ], // If a single constraint argument is an array, it must be within another array to indicate that its items are not individual arguments.
     *   equalTo: [ ['gender', 'f'], ['country', 'US'] ], // An array of 2 or more arrays indicates that the constraint method should be called once with each inner array as its arguments.
     *   notEqualTo: ['company', 'IBM'] // There is just one set of parameters, so there is no need to enclose in another array.
     * }
     * Parsimonious.constrainQuery(query, constraints)
     *
     * // which is equivalent to:
     *
     * const query = new Parse.Query(Parse.User)
     * query.startsWith('name', 'Sal')
     * query.limit(10)
     * query.select('name')
     * query.select('email')
     * query.select('birthDate')
     *
     *
     * @param {Parse.Query} query The query on which to call the constraint methods
     * @param {object} constraints Plain object containing query constraint methods as keys and arguments as values
     * @returns {Parse.Query}
     */

  }, {
    key: 'constrainQuery',
    value: function constrainQuery(query, constraints) {
      if (query instanceof this.Parse.Query && (0, _isPlainObject2.default)(constraints)) {
        var nonConstraints = ['count', 'each', 'find', 'first', 'get', 'toJSON'];
        Object.keys(constraints).forEach(function (constraint) {
          if (typeof query[constraint] === 'function' && nonConstraints.indexOf(constraint) === -1) {
            // constraint is the string name of a Query constraint method
            var args = constraints[constraint];
            if (!Array.isArray(args)) {
              args = [args];
            }
            var argSets = args.length > 1 && args.every(Array.isArray) ? args : [args];
            argSets.forEach(function (argSet) {
              try {
                query[constraint].apply(query, _toConsumableArray(argSet));
              } catch (e) {
                throw new Error('constrainQuery error calling the "' + constraint + '" function with args "' + argSet.toString() + '" on Parse.Query instance: ' + e.toString());
              }
            });
          } else {
            throw new RangeError('Parse.Query does not have a constraint method named "' + constraint + '"');
          }
        });
        return query;
      } else {
        throw new TypeError('invalid query or constraints');
      }
    }

    /**
     * Return a Parse.Object instance from className and id.
     * @param {string|object} aClass class name or constructor
     * @param {string} id
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     */

  }, {
    key: 'getObjById',
    value: function getObjById(aClass, id, opts) {
      return this.newQuery(aClass).get(id, opts);
    }

    /**
     * Return Parse.User instance from user id
     * @param {string} id
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.User}
     */

  }, {
    key: 'getUserById',
    value: function getUserById(id, opts) {
      return this.getObjById('User', id, opts);
    }

    /**
     * Given a value thing, return a promise that resolves to
     * - thing if thing is a clean Parse.Object,
     * - fetched Parse.Object if thing is a dirty Parse.Object,
     * - fetched Parse.Object if thing is a pointer;
     * - thing if otherwise
     * @param {*} thing
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @return {Parse.Promise}
     */

  }, {
    key: 'fetchIfNeeded',
    value: function fetchIfNeeded(thing, opts) {
      if (this.isPFObject(thing)) {
        return thing.dirty() ? thing.fetch(opts) : this.Parse.Promise.as(thing);
      } else if (this.isPointer(thing) && typeof thing.className === 'string') {
        return this.getObjById(thing.className, thing.objectId, opts);
      } else {
        return this.Parse.Promise.as(thing);
      }
    }

    /* ROLES */

  }, {
    key: 'getRole',
    value: function getRole(name, opts) {
      return this.newQuery('Role').equalTo('name', name).first(opts);
    }

    /**
     * Return array of names of user's direct roles, or empty array.
     * Requires that the Roles class has appropriate read permissions.
     * @param {Parse.User} user
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @return {Parse.Promise}
     */

  }, {
    key: 'getUserRoles',
    value: function getUserRoles(user, opts) {
      return this.newQuery('Role').equalTo('users', user).find(opts).then(function (roles) {
        return Array.isArray(roles) && roles.length > 0 ? roles.map(function (role) {
          return role.get('name');
        }) : [];
      });
    }

    /**
     * Check if a user has a role, or any or all of multiple roles, return a promise resolving to true or false.
     * @param {Parse.User} user
     * @param {string|object} roles Can be single role name string, or object containing 'names' key whose value is an array of role names and 'op' key with value 'and' or 'or'
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @return {Parse.Promise}
     */

  }, {
    key: 'userHasRole',
    value: function userHasRole(user, roles, opts) {
      if (!this.isUser(user)) {
        return this.rej('invalid user');
      }
      var roleQuery = this.newQuery('Role').equalTo('users', user);
      if (typeof roles === 'string') {
        roleQuery.equalTo('name', roles);
        return roleQuery.first(opts).then(function (result) {
          return result !== undefined;
        });
      } else if ((0, _isPlainObject2.default)(roles) && Array.isArray(roles.names) && roles.op) {
        roleQuery.containedIn('name', roles.names);
        return roleQuery.count(opts).then(function (result) {
          return roles.op === 'and' ? result === roles.names.length : result > 0;
        });
      } else {
        return this.rej('invalid roles');
      }
    }

    /* MANY-TO-MANY RELATIONSHIPS */

    /**
     * Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.
     * @param {string} from First class name
     * @param {string} to Second class name
     * @returns {string}
     */

  }, {
    key: 'getJoinTableName',
    value: function getJoinTableName(from, to) {
      return from + '2' + to;
    }

    /**
     * Converts a variable number of arguments into 4 variables used by the joinWithTable, unJoinWithTable, getJoinQuery methods.
     * @returns {object}
     */

  }, {
    key: '_getJoinTableClassVars',
    value: function _getJoinTableClassVars() {
      var cn1 = void 0,
          cn2 = void 0,
          obj1 = void 0,
          obj2 = void 0;
      if ((0, _isPlainObject2.default)(arguments[0])) {
        var _Object$keys = Object.keys(arguments[0]);

        var _Object$keys2 = _slicedToArray(_Object$keys, 2);

        cn1 = _Object$keys2[0];
        cn2 = _Object$keys2[1];
        var _ref = [arguments[0][cn1], arguments[0][cn2]];
        obj1 = _ref[0];
        obj2 = _ref[1];
      } else if (this.isPFObject(arguments[0])) {
        obj1 = arguments[0];
        cn1 = obj1.className;
        obj2 = arguments[1];
        cn2 = obj2.className;
      } else {
        throw new TypeError('_getJoinTableClassVars called with invalid parameters');
      }
      if (cn1 && cn2 && (this.isPFObjectOrPointer(obj1) || this.isPFObjectOrPointer(obj2))) {
        return { cn1: cn1, cn2: cn2, obj1: obj1, obj2: obj2 };
      }
    }

    /**
     * Join two parse objects in a many-to-many relationship by adding a document to a third join table.
     * Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
     * Creates join tables which are named with the class names separated with the numeral 2; e.g.: Student2Course.
     * (For backwards-compatibility with v4.1.0, this method may still be called with the 3 parameters
     * 'classes', 'metadata', and 'opts', where 'classes' is a plain object whose two keys are the classes to join,
     * and whose values are the Parse.Object instances.)
     *
     * @example
     * // Record the fact that a student completed a course, with date of completion and grade earned:
     * const student = <instance of Parse.Student subclass>
     * const course = <instance of Parse.Course subclass>
     * const meta = {completed: new Date(2017, 11, 17), grade: 3.2}
     * const opts = {sessionToken: 'r:cbd9ac93162d0ba1287970fb85d8d168'}
     * Parsimonious.joinWithTable(student, course, meta, opts)
     *    .then(joinObj => {
     *      // joinObj is now an instance of the class 'Student2Course', which was created if it didn't exist.
     *      // The Student2Course class has pointer columns 'student' and 'course',
     *      // plus a date column named 'completed' and a numeric column named 'grade'.
     *    })
     *
     * @param {Parse.Object} object1 Parse object or pointer
     * @param {Parse.Object} object2 Parse object or pointer
     * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.Promise}
     */

  }, {
    key: 'joinWithTable',
    value: function joinWithTable() {
      var _getJoinTableClassVar = this._getJoinTableClassVars.apply(this, arguments),
          cn1 = _getJoinTableClassVar.cn1,
          cn2 = _getJoinTableClassVar.cn2,
          obj1 = _getJoinTableClassVar.obj1,
          obj2 = _getJoinTableClassVar.obj2;

      var argIndex = this.isPFObject(arguments[0]) ? 2 : 1,
          meta = arguments[argIndex],
          opts = arguments[argIndex + 1];
      var joinObj = this.getClassInst(this.getJoinTableName(cn1, cn2));
      joinObj.set((0, _lowerFirst2.default)(cn1), obj1);
      joinObj.set((0, _lowerFirst2.default)(cn2), obj2);
      if ((0, _isPlainObject2.default)(meta)) {
        this.objSetMulti(joinObj, meta);
      }
      return joinObj.save(null, opts);
    }

    /**
     * Unjoin two parse objects previously joined by Parsimonious.joinWithTable
     * If can't unjoin objects, returned promise resolves to undefined.
     * (For backwards-compatibility with v4.1.0, this method may still be called with the 2 parameters
     * 'classes' and 'opts', where 'classes' is a plain object whose two keys are the classes to join,
     * and whose values are the Parse.Object instances.)
     * @param {Parse.Object} object1 Parse object or pointer
     * @param {Parse.Object} object2 Parse object or pointer
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.Promise}
     */

  }, {
    key: 'unJoinWithTable',
    value: function unJoinWithTable() {
      var _getJoinQuery,
          _this = this;

      var _getJoinTableClassVar2 = this._getJoinTableClassVars.apply(this, arguments),
          cn1 = _getJoinTableClassVar2.cn1,
          cn2 = _getJoinTableClassVar2.cn2,
          obj1 = _getJoinTableClassVar2.obj1,
          obj2 = _getJoinTableClassVar2.obj2;

      var opts = arguments[this.isPFObject(arguments[0]) ? 2 : 1];
      return this.getJoinQuery((_getJoinQuery = {}, _defineProperty(_getJoinQuery, cn1, obj1), _defineProperty(_getJoinQuery, cn2, obj2), _getJoinQuery)).first(opts).then(function (joinObj) {
        if (_this.isPFObject(joinObj)) {
          return joinObj.destroy(opts);
        } else {
          return _this.Parse.Promise.as(undefined);
        }
      });
    }

    /**
     * Return a query on a many-to-many join table created by Parsimonious.joinWithTable.
     *
     * @example
     * // Find the join table record linking a particular student and course together:
     * const classes = {
     *    Student: <instance of Student class>,
     *    Course: <instance of Course class>
     * }
     * Parsimonious.getJoinQuery(classes)
     *    .first()
     *    .then(joinObj => {
     *      // joinObj is the instance of the class 'Student2Course'
     *      // that was created by Parsimonious.joinWithTable}
     *      // to link that particular student and course together,
     *      // along with any metadata describing the relationship.
     *    })
     * @example
     * // Find all courses taken by a particular student:
     * const classes = {
     *    Student: <instance of Student class>,
     *    Course: null
     * }
     * Parsimonious.getJoinQuery(classes)
     *    .find()
     *    .then(joinObjs => {
     *      // joinObj is an array of instances of the class 'Student2Course'
     *      // that were created by Parsimonious.joinWithTable}.
     *    })
     * @example
     * // Find the top 10 students who have taken a particular course and received a grade of at least 3:
     * const classes = {
     *    Student: null,
     *    Course: <instance of Course class>
     * }
     * Parsimonious.getJoinQuery(classes, {
     *    descending: 'grade',
     *    greaterThanOrEqualTo: ['grade', 3],
     *    limit: 10
     * }).find()
     * @param {object} classes Must contain two keys corresponding to existing classes. At least one key's value must be a valid parse object. If the other key's value is not a valid parse object, the query retrieves all objects of the 2nd key's class that are joined to the object of the 1st class. Same for vice-versa. If both values are valid parse objects, then the query should return zero or one row from the join table.
     * @param {object=} constraints (Options for Parsimonious.newQuery})
     * @returns {Parse.Query}
     */

  }, {
    key: 'getJoinQuery',
    value: function getJoinQuery(classes) {
      var constraints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _getJoinTableClassVar3 = this._getJoinTableClassVars.apply(this, arguments),
          cn1 = _getJoinTableClassVar3.cn1,
          cn2 = _getJoinTableClassVar3.cn2,
          obj1 = _getJoinTableClassVar3.obj1,
          obj2 = _getJoinTableClassVar3.obj2;

      if (!(0, _isPlainObject2.default)(constraints)) {
        throw new TypeError('getJoinQuery called with invalid constraints');
      }
      var equalToArgSets = [];
      if (this.isPFObjectOrPointer(obj1, cn1)) {
        equalToArgSets.push([(0, _lowerFirst2.default)(cn1), obj1]);
      }
      if (this.isPFObjectOrPointer(obj2, cn2)) {
        equalToArgSets.push([(0, _lowerFirst2.default)(cn2), obj2]);
      }
      if (equalToArgSets.length) {
        constraints.equalTo = equalToArgSets.length > 1 ? equalToArgSets : equalToArgSets[0];
      }
      return this.newQuery(this.getJoinTableName(cn1, cn2), constraints);
    }

    /**
     * Return a pointer to a Parse.Object.
     * @param {string} className
     * @param {string} objectId
     * @returns {object}
     */

  }, {
    key: 'getPointer',
    value: function getPointer(className, id) {
      if (typeof className === 'string' && typeof id === 'string') {
        return this.getClass(className).createWithoutData(id);
      } else {
        throw new TypeError('getPointer called with non-string parameters');
      }
    }

    /* TYPE CHECKS  */

    /**
     * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User or Parse.MyCustomClass)
     * @param {*} thing
     * @param {string=} ofClass Optionally check if it's of a specific ParseObjectSubclass
     * @returns {boolean}
     */

  }, {
    key: 'isPFObject',
    value: function isPFObject(thing, ofClass) {
      return (thing instanceof this.Parse.Object || (typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === 'object' && (0, _get2.default)(thing, '__proto__.constructor.name') === 'ParseObjectSubclass') && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true);
    }

    /**
     * Return true if thing is array of Parse.Object
     * @param {*} thing
     * @param {string=} ofClass Optionally check if it's of a specific ParseObjectSubclass
     * @returns {boolean}
     */

  }, {
    key: 'isArrayOfPFObjects',
    value: function isArrayOfPFObjects(thing, ofClass) {
      var _this2 = this;

      return Array.isArray(thing) && thing.every(function (item) {
        return _this2.isPFObject(item, ofClass);
      });
    }

    /**
     * Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.
     * @param {*} thing
     * @param {string=} ofClass Optionally check if it's of a specific ParseObjectSubclass
     * @returns {boolean}
     */

  }, {
    key: 'isPointer',
    value: function isPointer(thing, ofClass) {
      return (this.isPFObject(thing) && thing.__type === 'Pointer' || (0, _isPlainObject2.default)(thing) && (typeof thing.id === 'string' || typeof thing.objectId === 'string') && typeof thing.className === 'string') && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true);
    }

    /**
     * Return true if thing is a Parse.Object or pointer
     * @param {*} thing
     * @param {string=} ofClass Optionally check if it's of a specific ParseObjectSubclass
     * @returns {boolean}
     */

  }, {
    key: 'isPFObjectOrPointer',
    value: function isPFObjectOrPointer(thing, className) {
      return this.isPFObject(thing, className) || this.isPointer(thing, className);
    }

    /**
     * Return true if thing is an instance of Parse.User.
     * @param {*} thing
     * @returns {boolean}
     */

  }, {
    key: 'isUser',
    value: function isUser(thing) {
      return thing instanceof this.Parse.User;
    }

    /* COMPARISONS */

    /**
     * Return true if values both represent the same Parse.Object instance (same class and id) even if one is a pointer and the other is a Parse.Object instance.
     * @param {Parse.Object|object} thing1
     * @param {Parse.Object|object} thing2
     * @returns {boolean}
     */

  }, {
    key: 'pfObjectMatch',
    value: function pfObjectMatch(thing1, thing2) {
      return this.isPFObjectOrPointer(thing1) && this.isPFObjectOrPointer(thing2) && thing1.className === thing2.className && this.getId(thing1) === this.getId(thing2);
    }

    /* DATA MANIPULATION */

    /**
     * Resolves thing to a Parse.Object, or attempts to retrieve from db if a pointer.
     * Resolves as undefined otherwise.
     * @param {(Parse.Object|object|string)=} thing
     * @param {string=} className If set, and first param is a Parse.Object, resolves to the Parse.Object only if it is of this class.
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.Promise}
     */

  }, {
    key: 'getPFObject',
    value: function getPFObject(thing, className, opts) {
      if (this.isPFObject(thing, className)) {
        return this.Parse.Promise.as(thing);
      } else if (this.isPointer(thing)) {
        return this.getObjById(thing.className, this.getId(thing), opts);
      } else {
        return this.Parse.Promise.as(undefined);
      }
    }

    /**
     * Return a json representation of a Parse.Object,
     * or of plain object that may contain Parse.Object instances,
     * optionally recursively.
     *
     * @param {*} thing Value to create json from.
     * @param {boolean=} deep If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.
     * @returns {*}
     */

  }, {
    key: 'toJsn',
    value: function toJsn(thing) {
      var _this3 = this;

      var deep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var obj = void 0;
      if (this.isPFObject(thing)) {
        obj = thing.toJSON();
      } else if ((0, _isPlainObject2.default)(thing)) {
        obj = Object.assign({}, thing);
      } else if (thing !== undefined) {
        obj = (0, _clone2.default)(thing);
      }
      if (deep && (0, _isPlainObject2.default)(obj)) {
        // Make more plain-object-like, and prevent Parse.Cloud.run from converting back into Parse.Object in responses:
        if (obj.objectId) {
          obj.id = obj.objectId;
        }
        obj = (0, _omit2.default)(obj, ['objectId', '__type', 'className', 'ACL']);
        // Convert all other properties of plain object to json.
        Object.keys(obj).forEach(function (k) {
          obj[k] = _this3.toJsn(obj[k], deep);
        });
      }
      return obj;
    }

    /**
     * Attempt to return the ID of thing if it's a Parse.Object or pointer.
     * If thing is a string, just return it.
     * Otherwise, return undefined.
     * @param {*} thing
     * @returns {string|undefined}
     */

  }, {
    key: 'getId',
    value: function getId(thing) {
      return typeof thing === 'string' ? thing : (0, _isPlainObject2.default)(thing) || this.isPFObjectOrPointer(thing) ? thing.id || thing.objectId : undefined;
    }

    /**
     * Get some columns from a Parse object and return them in a plain object.
     * If keys is not an array or comma-separated string, return undefined.
     * @example
     * const car = new Parse.Object.extend('Car')
     *
     * car.set('type', 'SUV')
     * car.set('interior', {
     *   seats:5,
     *   leather: {
     *     color: 'tan',
     *     seats: true,
     *     doors: false
     *   }
     * })
     * car.set('specs', {
     *   length: 8,
     *   height: 4,
     *   performance: {
     *     speed: 120,
     *     zeroTo60: 6
     *   }
     * })
     *
     * Parsimonious.objPick(car, 'type,interior.leather,specs.performance.speed')
     * // returns
     *  {
     *    type: 'SUV',
     *    interior: {
     *      leather: {
     *       color: 'tan',
     *       seats: true,
     *      doors: false
     *    },
     *    specs: {
     *      performance: {
     *        speed: 120
     *      }
     *    }
     *  }
     * @param {Parse.Object} parseObj
     * @param {(string | string[])} keys
     * @returns {object}
     */

  }, {
    key: 'objPick',
    value: function objPick(parseObj, keys) {
      if (this.isPFObject(parseObj) && (Array.isArray(keys) || typeof keys === 'string')) {
        return (0, _pick2.default)(parseObj.toJSON(), this._toArray(keys));
      }
    }

    /**
     * Get the value of a key from a Parse object and return the value of a nested key within it.
     * @example
     * const car = new Parse.Object.extend('Car')
     * car.set('type', 'SUV')
     * car.set('interior', {
     *   seats:5,
     *   leather: {
     *     color: 'tan',
     *     seats: true,
     *     doors: false
     *   }
     * })
     * Parsimonious.objGetDeep(car, 'interior.leather.color')
     * // returns "tan"
     *
     * @param {Parse.Object} parseObj
     * @param {string} path Dot-notation path whose first segment is the column name.
     * @returns {*}
     */

  }, {
    key: 'objGetDeep',
    value: function objGetDeep(parseObj, path) {
      if (this.isPFObject(parseObj) && typeof path === 'string') {
        return (0, _get2.default)(parseObj.toJSON(), path);
      }
    }

    /**
     * Set some columns on a Parse object.
     * Mutates the Parse object.
     * @param {Parse.Object} parseObj
     * @param {object} dataObj
     * @param {boolean=} doMerge If true, each column value is shallow-merged with existing value
     */

  }, {
    key: 'objSetMulti',
    value: function objSetMulti(parseObj, dataObj) {
      var doMerge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.isPFObject(parseObj) && (0, _isPlainObject2.default)(dataObj)) {
        var key = void 0,
            oldVal = void 0,
            newVal = void 0;
        for (key in dataObj) {
          oldVal = parseObj.get(key);
          newVal = dataObj[key];
          if (doMerge && (0, _isPlainObject2.default)(oldVal) && (0, _isPlainObject2.default)(newVal)) {
            newVal = (0, _merge2.default)(oldVal, newVal);
          }
          parseObj.set(key, newVal);
        }
      }
    }

    /**
     * Sort an array of Parse objects by key (column name)
     * Mutates array.
     * @param {object[]} [objs]
     * @param {string} key
     */

  }, {
    key: 'sortPFObjectsByKey',
    value: function sortPFObjectsByKey(objs, key) {
      if (this.isArrayOfPFObjects(objs)) {
        objs.sort(function (a, b) {
          var aVal = a.get(key);
          var bVal = b.get(key);
          if (aVal < bVal) {
            return -1;
          } else if (aVal > bVal) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        throw new TypeError('sortPFObjectsByKey called with invalid array of Parse.Object');
      }
    }

    /**
     * Copy a set of attributes from one instance of Parse.Object to another.
     * Mutates target Parse.Object.
     * @param {Parse.Object} from
     * @param {Parse.Object} to Is mutated.
     * @param {(string|string[])} attributeNames
     */

  }, {
    key: 'copyPFObjectAttributes',
    value: function copyPFObjectAttributes(from, to, attributeNames) {
      if (this.isPFObject(from) && this.isPFObject(to)) {
        var arr = this._toArray(attributeNames, 'string');
        if (Array.isArray(arr) && arr.length > 0) {
          this.objSetMulti(to, this.objPick(from, arr));
        }
      }
    }

    /**
     * Return true if any of the passed keys are dirty in parseObj
     * @param {Parse.Object} parseObj
     * @param {(string|string[])} keys Array of string or comma-separated string list of keys.
     * @returns {boolean}
     */

  }, {
    key: 'keysAreDirty',
    value: function keysAreDirty(parseObj, keys) {
      return this.isPFObject(parseObj) && (0, _intersection2.default)(parseObj.dirtyKeys(), this._toArray(keys, 'string')).length > 0;
    }

    /**
     * Returns valid class name when passed either a subclass of Parse.Object or any string.
     * Removes the underscore if it is one of the special classes with a leading underscore.
     * Returns undefined if anything else.
     *
     * @param {object|string} thing
     * @return {string}
     */

  }, {
    key: 'getPFObjectClassName',
    value: function getPFObjectClassName(thing) {
      var str = typeof thing === 'string' ? thing : (typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === 'object' && thing.className ? thing.className : null;
      if (typeof str === 'string') {
        return str.substring(0, 1) === '_' && specialClasses.indexOf(str.substring(1)) !== -1 ? str.substring(1) : str;
      }
    }

    /**
     * Returns the corresponding special Parse class (like 'User') if passed the name of one; otherwise, returns the value unchanged.
     * @param {string} thing
     * @returns {*}
     */

  }, {
    key: 'classStringOrSpecialClass',
    value: function classStringOrSpecialClass(thing) {
      if (typeof thing === 'string') {
        return specialClasses.indexOf(thing) !== -1 ? this.Parse[thing] : thing;
      }
    }

    /**
     * If className represents one of the special classes like 'User,' return prefixed with an underscore.
     * @param className
     */

  }, {
    key: 'classNameToParseClassName',
    value: function classNameToParseClassName(className) {
      return specialClasses.indexOf(className) !== -1 ? '_' + className : className;
    }

    /**
     * Return thing if array, string[] if string, otherwise array with thing as only item, even if undefined.
     * @param {*} thing
     * @param {string=} type If set, only include values of this type in resulting array.
     * @returns {array}
     */

  }, {
    key: '_toArray',
    value: function _toArray(thing, type) {
      var rawArr = Array.isArray(thing) ? thing : typeof thing === 'string' ? thing.split(',') : [thing];
      return typeof type === 'string' ? rawArr.filter(function (item) {
        return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === type;
      }) : rawArr;
    }
  }]);

  return Parsimonious;
}();

// Attempt to set the Parse JS SDK instance to be used:

var whichParse = void 0;
if ((typeof Parse === 'undefined' ? 'undefined' : _typeof(Parse)) === 'object') {
  whichParse = Parse;
} else if (_detectIsNode2.default) {
  whichParse = require('parse/node');
} else {
  whichParse = require('parse');
}
Parsimonious.setParse(whichParse);

exports.default = Parsimonious;