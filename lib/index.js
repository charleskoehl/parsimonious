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

var _isInteger = require('lodash/isInteger');

var _isInteger2 = _interopRequireDefault(_isInteger);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

var _lowerFirst = require('lodash/lowerFirst');

var _lowerFirst2 = _interopRequireDefault(_lowerFirst);

var _detectIsNode = require('detect-is-node');

var _detectIsNode2 = _interopRequireDefault(_detectIsNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      if ((typeof parse === 'undefined' ? 'undefined' : _typeof(parse)) === 'object') {
        this.Parse = parse;
        this.rej = this.Parse.Promise.reject;
      } else {
        throw new TypeError('non-object passed as Parse object');
      }
    }

    /**
     * Return a new Parse.Query instance from a Parse Object class name.
     * @param {(Parse.Object|string)} aClass Parse class instance or name
     * @param {object=} opts Query restrictions
     * @param {number=} opts.limit Parameter for Parse.Query.limit. Must be integer greater than zero.
     * @param {number=} opts.skip Parameter for Parse.Query.skip. Must be integer greater than zero.
     * @param {string[]} [opts.select] Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys.
     * @returns {Parse.Query}
     */

  }, {
    key: 'newQuery',
    value: function newQuery(aClass, opts) {
      var clsInst = this.isPFObject(aClass) ? aClass : this.getClassInst(aClass);
      var q = new this.Parse.Query(clsInst);
      if ((0, _isPlainObject2.default)(opts)) {
        var skip = opts.skip,
            limit = opts.limit,
            select = opts.select;

        (0, _isInteger2.default)(skip) && skip > 0 && q.skip(skip);
        (0, _isInteger2.default)(limit) && limit > 0 && q.limit(limit);
        select && q.select(this._toArray(select));
      }
      return q;
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
     *   thing if thing is a clean Parse.Object,
     *   fetched Parse.Object if thing is a dirty Parse.Object,
     *   fetched Parse.Object if thing is a pointer;
     *   thing if otherwise
     * @param {*} thing
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @return {Parse.Promise} Promise that fulfills with saved UserPrefs object.
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

    /**
     * Short-hand for Parse.Object.extend(className) or Parse.<special class name like 'User'>
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
     * Return classes object deconstructed into 4 variables used for some join table methods.
     * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
     * @returns {object}
     */

  }, {
    key: '_getJoinTableClassVars',
    value: function _getJoinTableClassVars(classes) {
      if ((0, _isPlainObject2.default)(classes)) {
        var _Object$keys = Object.keys(classes),
            _Object$keys2 = _slicedToArray(_Object$keys, 2),
            cn1 = _Object$keys2[0],
            cn2 = _Object$keys2[1];

        var _ref = [classes[cn1], classes[cn2]],
            obj1 = _ref[0],
            obj2 = _ref[1];

        if (cn1 && cn2 && (this.isPFObject(obj1) || this.isPFObject(obj2))) {
          return { cn1: cn1, cn2: cn2, obj1: obj1, obj2: obj2 };
        }
      }
      throw new Error('invalid "classes" passed');
    }

    /**
     * Join two parse objects in a many-to-many relationship by adding a document to a third join table.
     * Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
     * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
     * @param {object} classes - must contain two keys corresponding to existing classes; each value must be a valid parse object.
     * @param {object=} metadata - optional key/value pairs to set on the new document to describe relationship.
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.Promise}
     */

  }, {
    key: 'joinWithTable',
    value: function joinWithTable(classes) {
      var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var opts = arguments[2];

      var _getJoinTableClassVar = this._getJoinTableClassVars(classes),
          cn1 = _getJoinTableClassVar.cn1,
          cn2 = _getJoinTableClassVar.cn2,
          obj1 = _getJoinTableClassVar.obj1,
          obj2 = _getJoinTableClassVar.obj2;

      var joinObj = this.getClassInst(this.getJoinTableName(cn1, cn2));
      joinObj.set((0, _lowerFirst2.default)(cn1), obj1);
      joinObj.set((0, _lowerFirst2.default)(cn2), obj2);
      if ((0, _isPlainObject2.default)(metadata)) {
        this.objSetMulti(joinObj, metadata);
      }
      return joinObj.save(null, opts);
    }

    /**
     * Return a query on a many-to-many join table.
     * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
     * Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.
     * @param {object} classes - must contain two keys corresponding to existing classes. At least one key's value must be a valid parse object. If the other key's value is not a valid parse object, the query retrieves all objects of the 2nd key's class that are joined to the object ofthe 1st class. Same for vice-versa. If both values are valid parse objects, then the query should return zero or one row from the join table.
     * @param {object=} opts Query restrictions (see Parsimonious.newQuery)
     * @returns {Parse.Query}
     */

  }, {
    key: 'getJoinQuery',
    value: function getJoinQuery(classes, opts) {
      var _getJoinTableClassVar2 = this._getJoinTableClassVars(classes),
          cn1 = _getJoinTableClassVar2.cn1,
          cn2 = _getJoinTableClassVar2.cn2,
          obj1 = _getJoinTableClassVar2.obj1,
          obj2 = _getJoinTableClassVar2.obj2;

      var query = this.newQuery(this.getJoinTableName(cn1, cn2), opts);
      this.isPFObject(obj1, cn1) && query.equalTo((0, _lowerFirst2.default)(cn1), obj1);
      this.isPFObject(obj2, cn2) && query.equalTo((0, _lowerFirst2.default)(cn2), obj2);
      return query;
    }

    /**
     * Unjoin two parse objects currently joined in a many-to-many relationship by a document in a third join table.
     * Like Parse.Relation.remove (see Parsimonious.joinWithTable above).
     * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
     * Join table must exist and have pointer columns named like class names,
     * except first letter lower-case; e.g.: employee, company.
     * If can't unjoin objects, returned promise resolves to undefined.
     * @param {object} classes - must contain two keys corresponding to existing classes;
     *                           each value must be a valid parse object already in db.
     * @param {object=} opts A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).
     * @returns {Parse.Promise}
     */

  }, {
    key: 'unJoinWithTable',
    value: function unJoinWithTable(classes, opts) {
      var _this = this;

      return this.getJoinQuery(classes, opts).first().then(function (joinObj) {
        if (_this.isPFObject(joinObj)) {
          return joinObj.destroy(opts);
        } else {
          return _this.Parse.Promise.as(undefined);
        }
      });
    }

    /**
     * Return a pointer to a Parse.Object.
     * @param {string} className
     * @param {string} objectId
     * @returns {object}
     */

  }, {
    key: 'getPointer',
    value: function getPointer(className, objectId) {
      if (typeof className === 'string' && typeof objectId === 'string') {
        return {
          __type: 'Pointer',
          className: this.classNameToParseClassName(className),
          objectId: objectId
        };
      } else {
        throw new TypeError('getPointer called with non-string parameters');
      }
    }

    /* TYPE CHECKS  */

    /**
     * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User or Parse.CustomClass)
     * @param {*} thing
     * @param {string=} ofClass
     * @returns {boolean}
     */

  }, {
    key: 'isPFObject',
    value: function isPFObject(thing, ofClass) {
      return thing instanceof this.Parse.Object
      // Check if correct class if specified.
      && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true);
    }

    /**
     * Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.
     * @param thing
     * @returns {boolean}
     */

  }, {
    key: 'isPointer',
    value: function isPointer(thing) {
      return this.isPFObject(thing) && thing.__type === 'Pointer' || (0, _isPlainObject2.default)(thing) && typeof thing.className === 'string' && (typeof thing.id === 'string' || typeof thing.objectId === 'string');
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

    /* CONVERSIONS / DATA MANIPULATION */

    /**
     * Return a json representation of a Parse.Object,
     * sub-class of Parse.Object (such as Parse.User),
     * or plain object containing any or none of those, to json, optionally recursively.
     * Does not mutate parameters.
     *
     * @param {*} thing Value to create json from.
     * @param {boolean=} deep If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.
     * @returns {*}
     */

  }, {
    key: 'toJsn',
    value: function toJsn(thing) {
      var _this2 = this;

      var deep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var obj = void 0;
      if (thing instanceof this.Parse.Object) {
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
          obj[k] = _this2.toJsn(obj[k], deep);
        });
      }
      return obj;
    }

    /**
     * Get some columns from a Parse object and return them in a plain object.
     * If keys is not an array or comma-separated string, return undefined.
     * @param {Parse.Object} parseObj
     * @param {(string | string[])} keys
     * @returns {object}
     */

  }, {
    key: 'objPick',
    value: function objPick(parseObj, keys) {
      return (0, _pick2.default)(this.toJsn(parseObj), this._toArray(keys));
    }

    /**
     * Get an an object-type column from a Parse object and return the value of a nested key within it.
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
     * @param {string} columnAndPath Dot-notation path whose first segment is the column name.
     * @returns {*}
     */

  }, {
    key: 'objGetDeep',
    value: function objGetDeep(parseObj, columnAndPath) {
      if (typeof columnAndPath === 'string') {
        var _columnAndPath$split = columnAndPath.split(/\.(.+)/),
            _columnAndPath$split2 = _slicedToArray(_columnAndPath$split, 2),
            column = _columnAndPath$split2[0],
            path = _columnAndPath$split2[1],
            columnVal = parseObj.get(column);

        if ((0, _isPlainObject2.default)(columnVal)) {
          return (0, _get2.default)(columnVal, path);
        }
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
      var str = typeof thing === 'string' ? thing : this.isPFObject(thing) ? thing.className : null;
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
     * Return array from array or comma-separated string list.
     * If passed a non-string, non-array value, returns it in an array.
     * @param {array|string} thing
     * @returns {array}
     * @private
     */

  }, {
    key: '_toArray',
    value: function _toArray(thing) {
      return Array.isArray(thing) ? thing : typeof thing === 'string' ? thing.split(',') : [thing];
    }
  }]);

  return Parsimonious;
}();

// Attempt to set the Parse JS SDK instance to be used:

var parseSrc = void 0;
if ((typeof Parse === 'undefined' ? 'undefined' : _typeof(Parse)) === 'object') {
  parseSrc = Parse;
} else if (_detectIsNode2.default) {
  parseSrc = require('parse/node');
} else {
  parseSrc = require('parse');
}
Parsimonious.setParse(parseSrc);

exports.default = Parsimonious;