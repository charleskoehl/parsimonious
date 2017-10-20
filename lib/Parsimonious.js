'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _autoBind = require('auto-bind');

var _autoBind2 = _interopRequireDefault(_autoBind);

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

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

var _lowerFirst = require('lodash/lowerFirst');

var _lowerFirst2 = _interopRequireDefault(_lowerFirst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.
 * @module Parsimonious
 */

var specialClasses = ['User', 'Role', 'Session'];

var Parsimonious = function () {
  function Parsimonious(parse) {
    _classCallCheck(this, Parsimonious);

    if (!Parsimonious.instance) {
      (0, _autoBind2.default)(this);
      Parsimonious.instance = this;
      this.Parse = parse;
    }
    return Parsimonious.instance;
  }

  /**
   * Return a new Parse.Query instance from a Parse Object class name.
   * @param {string|object} aClass class name or constructor
   * @param {object=} opts Query restrictions
   * @param {number=} opts.limit Parameter for Parse.Query.limit. Must be integer greater than zero.
   * @param {number=} opts.skip Parameter for Parse.Query.skip. Must be integer greater than zero.
   * @param {string[]} [opts.select] Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys.
   * @returns {Parse.Query}
   */


  _createClass(Parsimonious, [{
    key: 'newQuery',
    value: function newQuery(aClass) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var q = new this.Parse.Query(aClass);
      var skip = opts.skip,
          limit = opts.limit,
          select = opts.select;

      if ((0, _isPlainObject2.default)(opts)) {
        (0, _isInteger2.default)(skip) && skip > 0 && q.skip(skip);
        (0, _isInteger2.default)(limit) && limit > 0 && q.limit(limit);
        var selectArray = void 0;
        if (Array.isArray(select) && select.length) {
          selectArray = select;
        } else if (typeof select === 'string') {
          selectArray = [select];
        }
        Array.isArray(selectArray) && q.select(selectArray);
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
      return this.newQuery(this.Parse.Role).equalTo('name', name).first(opts);
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
      return this.newQuery(this.Parse.Role).equalTo('users', user).find(opts).then(function (roles) {
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
        throw 'no user';
      }
      var roleQuery = this.newQuery(this.Parse.Role).equalTo('users', user);
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
        throw 'invalid roles';
      }
    }

    /**
     * Short-hand for this.Parse.Object.extend(className)
     * @param className
     * @returns subclass of Parse.Object
     */

  }, {
    key: 'getClass',
    value: function getClass(className) {
      return this.Parse.Object.extend(className);
    }

    /**
     * Return instance of Parse.Object class.
     * @param {string} className
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
     * Join two parse objects in a many-to-many relationship by adding a document to a third join table.
     * Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
     * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
     * Join table must exist and have pointer columns named like class names,
     * except first letter lower-case; e.g.: employee, company.
     * Returns promise.
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

      var classNames = Object.keys(classes);
      var classInstances = [classes[classNames[0]], classes[classNames[1]]];
      var joinTableName = this.getJoinTableName(classNames[0], classNames[1]);
      var joinObj = this.getClassInst(joinTableName);
      joinObj.set((0, _lowerFirst2.default)(classNames[0]), classInstances[0]);
      joinObj.set((0, _lowerFirst2.default)(classNames[1]), classInstances[1]);
      if ((0, _isPlainObject2.default)(metadata)) {
        this.objSetMulti(joinObj, metadata);
      }
      return joinObj.save(null, opts);
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
     * Return a query on a many-to-many join table.
     * Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
     * Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.
     * @param {object} classes - must contain two keys corresponding to existing classes, with each key's value being either a valid parse object or null
     * @param {object=} opts Query restrictions (see Parsimonious.newQuery)
     * @returns {Parse.Query}
     */

  }, {
    key: 'getJoinQuery',
    value: function getJoinQuery(classes, opts) {
      var classNames = Object.keys(classes);
      var classInstances = [classes[classNames[0]], classes[classNames[1]]];
      var query = this.newQuery(this.getJoinTableName(classNames[0], classNames[1]), opts);
      this.isPFObject(classInstances[0], classNames[0]) && query.equalTo((0, _lowerFirst2.default)(classNames[0]), classInstances[0]);
      this.isPFObject(classInstances[1], classNames[1]) && query.equalTo((0, _lowerFirst2.default)(classNames[1]), classInstances[1]);
      return query;
    }

    /* TYPE CHECKS  */

    /**
     * Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.
     * @param thing
     * @returns {boolean}
     */

  }, {
    key: 'isPointer',
    value: function isPointer(thing) {
      if ((typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === 'object' && thing !== null) {
        var keys = Object.keys(thing);
        return (0, _isEqual2.default)(keys, ['__type', 'className', 'objectId']) && thing.__type === 'Pointer' && typeof thing.objectId === 'string' && typeof thing.className === 'string' || (0, _isEqual2.default)(keys, ['className', '_objCount', 'id']) && typeof thing.className === 'string' && typeof thing.id === 'string' || (0, _isEqual2.default)(keys, ['objectId']) && typeof thing.objectId === 'string';
      }
      return false;
    }

    /**
     * Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)
     * @param {*} thing
     * @param {string=} ofClass
     * @returns {boolean}
     */

  }, {
    key: 'isPFObject',
    value: function isPFObject(thing, ofClass) {
      return thing !== null && (typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === 'object' && typeof thing._objCount === 'number' && typeof thing.className === 'string'
      // Check if correct class if specified.
      && (typeof ofClass === 'string' ? this.getPFObjectClassName(thing) === ofClass : true);
    }

    /**
     * Return true if thing is an instance of Parse.User.
     * @param {*} thing
     * @returns {boolean}
     */

  }, {
    key: 'isUser',
    value: function isUser(thing) {
      return this.isPFObject(thing, 'User');
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
      if (this.isPFObject(thing)) {
        obj = thing.toJSON();
      } else if ((0, _isPlainObject2.default)(thing)) {
        obj = Object.assign({}, thing);
      } else {
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
     * Set some columns on a Parse object. Mutates the Parse object.
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
     * Returns valid class-name when passed either a subclass of Parse.Object or any string.
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
     * Return array from array or comma-separated string list.
     * If passed a non-string, non-array value, returns it in an array.
     * @param {array|string} thing
     * @returns {any}
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

exports.default = Parsimonious;