[![buildstatus](https://travis-ci.org/charleskoehl/parsimonious.svg?branch=master)](https://travis-ci.org/charleskoehl/parsimonious)
[![codecov](https://codecov.io/gh/charleskoehl/parsimonious/branch/master/graph/badge.svg)](https://codecov.io/gh/charleskoehl/parsimonious)

## Utilities for Parse Server cloud code and JS SDK

## Usage
#### Basic:
```javascript
const parsm = require('parsimonious')
const CoolThing = parsm.getClassInst('CoolThing', {color: 'Red'})
```
#### Override the Parse instance used:
```javascript
// Initialize Parse JS SDK first:
Parse.initialize('myAppId')
Parse.masterKey = 'myMasterKey'

// Initialize parsimonious with the initialized Parse instance:
const parsm = require('parsimonious')
parsm.setParse(Parse)

// Call the methods:
const CoolThing = parsm.getClassInst('CoolThing', {color: 'Red'})
```

[Change Log](#changelog)

<a name="Parsimonious"></a>

## Parsimonious
**Kind**: global class  

* [Parsimonious](#Parsimonious)
    
    * [.setParse(parse)](#Parsimonious.setParse)
    * [.newQuery(aClass, [opts])](#Parsimonious.newQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(aClass, id, [opts])](#Parsimonious.getObjById)
    * [.getUserById(id, [opts])](#Parsimonious.getUserById) ⇒ <code>Parse.User</code>
    * [.fetchIfNeeded(thing, [opts])](#Parsimonious.fetchIfNeeded) ⇒ <code>Parse.Promise</code>
    * [.getUserRoles(user, [opts])](#Parsimonious.getUserRoles) ⇒ <code>Parse.Promise</code>
    * [.userHasRole(user, roles, [opts])](#Parsimonious.userHasRole) ⇒ <code>Parse.Promise</code>
    * [.getClass(className)](#Parsimonious.getClass) ⇒
    * [.getClassInst(className, [attributes], [options])](#Parsimonious.getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#Parsimonious.getJoinTableName) ⇒ <code>string</code>
    * [.joinWithTable(classes, [metadata], [opts])](#Parsimonious.joinWithTable) ⇒ <code>Parse.Promise</code>
    * [.unJoinWithTable(classes, [opts])](#Parsimonious.unJoinWithTable) ⇒ <code>Parse.Promise</code>
    * [.getJoinQuery(classes, [opts])](#Parsimonious.getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.isPFObject(thing, [ofClass])](#Parsimonious.isPFObject) ⇒ <code>boolean</code>
    * [.isPointer(thing)](#Parsimonious.isPointer) ⇒ <code>boolean</code>
    * [.isUser(thing)](#Parsimonious.isUser) ⇒ <code>boolean</code>
    * [.toJsn(thing, [deep])](#Parsimonious.toJsn) ⇒ <code>\*</code>
    * [.objPick(parseObj, keys)](#Parsimonious.objPick) ⇒ <code>object</code>
    * [.objGetDeep(parseObj, columnAndPath)](#Parsimonious.objGetDeep) ⇒ <code>\*</code>
    * [.objSetMulti(parseObj, dataObj, [doMerge])](#Parsimonious.objSetMulti)
    * [.getPFObjectClassName(thing)](#Parsimonious.getPFObjectClassName) ⇒ <code>string</code>
    * [.classStringOrSpecialClass(thing)](#Parsimonious.classStringOrSpecialClass) ⇒ <code>\*</code>

<a name="new_Parsimonious_new"></a>


Utilities for Parse Server cloud code and JS SDK.

<a name="Parsimonious.setParse"></a>

### Parsimonious.setParse(parse)
Set the instance of the Parse JS SDK to be used by all methods:

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parse <code>object</code> - instance of the Parse JS SDK

<a name="Parsimonious.newQuery"></a>

### Parsimonious.newQuery(aClass, [opts]) ⇒ <code>Parse.Query</code>
Return a new Parse.Query instance from a Parse Object class name.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- aClass <code>string</code> | <code>object</code> - class name or constructor
- [opts] <code>object</code> - Query restrictions
    - [.limit] <code>number</code> - Parameter for Parse.Query.limit. Must be integer greater than zero.
    - [.skip] <code>number</code> - Parameter for Parse.Query.skip. Must be integer greater than zero.
    - [.select] <code>Array.&lt;string&gt;</code> - Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys.

<a name="Parsimonious.getObjById"></a>

### Parsimonious.getObjById(aClass, id, [opts])
Return a Parse.Object instance from className and id.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- aClass <code>string</code> | <code>object</code> - class name or constructor
- id <code>string</code>
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.getUserById"></a>

### Parsimonious.getUserById(id, [opts]) ⇒ <code>Parse.User</code>
Return Parse.User instance from user id

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- id <code>string</code>
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.fetchIfNeeded"></a>

### Parsimonious.fetchIfNeeded(thing, [opts]) ⇒ <code>Parse.Promise</code>
Given a value thing, return a promise that resolves to
  thing if thing is a clean Parse.Object,
  fetched Parse.Object if thing is a dirty Parse.Object,
  fetched Parse.Object if thing is a pointer;
  thing if otherwise

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Returns**: <code>Parse.Promise</code> - Promise that fulfills with saved UserPrefs object.  
**Params**

- thing <code>\*</code>
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.getUserRoles"></a>

### Parsimonious.getUserRoles(user, [opts]) ⇒ <code>Parse.Promise</code>
Return array of names of user's direct roles, or empty array.
Requires that the Roles class has appropriate read permissions.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- user <code>Parse.User</code>
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.userHasRole"></a>

### Parsimonious.userHasRole(user, roles, [opts]) ⇒ <code>Parse.Promise</code>
Check if a user has a role, or any or all of multiple roles, return a promise resolving to true or false.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- user <code>Parse.User</code>
- roles <code>string</code> | <code>object</code> - Can be single role name string, or object containing 'names' key whose value is an array of role names and 'op' key with value 'and' or 'or'
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.getClass"></a>

### Parsimonious.getClass(className) ⇒
Short-hand for Parse.Object.extend(className)

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Returns**: subclass of Parse.Object  
**Params**

- className <code>string</code>

<a name="Parsimonious.getClassInst"></a>

### Parsimonious.getClassInst(className, [attributes], [options]) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- className <code>string</code>
- [attributes] <code>object</code> - Properties to set on new object.
- [options] <code>object</code> - Options to use when creating object.

<a name="Parsimonious.getJoinTableName"></a>

### Parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- from <code>string</code> - First class name
- to <code>string</code> - Second class name

<a name="Parsimonious.joinWithTable"></a>

### Parsimonious.joinWithTable(classes, [metadata], [opts]) ⇒ <code>Parse.Promise</code>
Join two parse objects in a many-to-many relationship by adding a document to a third join table.
Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
Returns promise.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- classes <code>object</code> - must contain two keys corresponding to existing classes; each value must be a valid parse object.
- [metadata] <code>object</code> <code> = </code> - optional key/value pairs to set on the new document to describe relationship.
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.unJoinWithTable"></a>

### Parsimonious.unJoinWithTable(classes, [opts]) ⇒ <code>Parse.Promise</code>
Unjoin two parse objects currently joined in a many-to-many relationship by a document in a third join table.
Like Parse.Relation.remove (see Parsimonious.joinWithTable above).
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
If can't unjoin objects, returned promise resolves to undefined.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- classes <code>object</code> - must contain two keys corresponding to existing classes;
                          each value must be a valid parse object already in db.
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.getJoinQuery"></a>

### Parsimonious.getJoinQuery(classes, [opts]) ⇒ <code>Parse.Query</code>
Return a query on a many-to-many join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- classes <code>object</code> - must contain two keys corresponding to existing classes, with each key's value being either a valid parse object or null
- [opts] <code>object</code> - Query restrictions (see Parsimonious.newQuery)

<a name="Parsimonious.isPFObject"></a>

### Parsimonious.isPFObject(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User or Parse.CustomClass)

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [ofClass] <code>string</code>

<a name="Parsimonious.isPointer"></a>

### Parsimonious.isPointer(thing) ⇒ <code>boolean</code>
Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing

<a name="Parsimonious.isUser"></a>

### Parsimonious.isUser(thing) ⇒ <code>boolean</code>
Return true if thing is an instance of Parse.User.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>

<a name="Parsimonious.toJsn"></a>

### Parsimonious.toJsn(thing, [deep]) ⇒ <code>\*</code>
Return a json representation of a Parse.Object,
sub-class of Parse.Object (such as Parse.User),
or plain object containing any or none of those, to json, optionally recursively.
Does not mutate parameters.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code> - Value to create json from.
- [deep] <code>boolean</code> <code> = false</code> - If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.

<a name="Parsimonious.objPick"></a>

### Parsimonious.objPick(parseObj, keys) ⇒ <code>object</code>
Get some columns from a Parse object and return them in a plain object.
If keys is not an array or comma-separated string, return undefined.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- keys <code>string</code> | <code>Array.&lt;string&gt;</code>

<a name="Parsimonious.objGetDeep"></a>

### Parsimonious.objGetDeep(parseObj, columnAndPath) ⇒ <code>\*</code>
Get an an object-type column from a Parse object and return the value of a nested key within it.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- columnAndPath <code>string</code> - Dot-notation path whose first segment is the column name.

<a name="Parsimonious.objSetMulti"></a>

### Parsimonious.objSetMulti(parseObj, dataObj, [doMerge])
Set some columns on a Parse object. Mutates the Parse object.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- dataObj <code>object</code>
- [doMerge] <code>boolean</code> <code> = false</code> - If true, each column value is shallow-merged with existing value

<a name="Parsimonious.getPFObjectClassName"></a>

### Parsimonious.getPFObjectClassName(thing) ⇒ <code>string</code>
Returns valid class-name when passed either a subclass of Parse.Object or any string.
Removes the underscore if it is one of the special classes with a leading underscore.
Returns undefined if anything else.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>object</code> | <code>string</code>

<a name="Parsimonious.classStringOrSpecialClass"></a>

### Parsimonious.classStringOrSpecialClass(thing) ⇒ <code>\*</code>
Returns the corresponding special Parse class if passed the name of one; otherwise, returns the value unchanged.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>string</code>


<a name="changelog"></a>
## Change Log

### Version 3.7.6 - 23rd October 2017
##### Changes
* Minor README changes, but published in order to get NPM to show the last few updates to README.

### Version 3.7.5 - 23rd October 2017
##### Changes
* Minor jsdoc fixes.

### Version 3.7.4 - 23rd October 2017
##### Fixes
* Uses 'browser' field in package.json to hint to webpack, browserify to substitute 'parse' for 'parse/node'

### Versions 3.7.1 - 3.7.3 - 22nd October 2017
##### Changes
* Minor README changes

### Version 3.7.0 - 22nd October 2017
##### Non-Breaking Change:
* Exports a class with static methods, rather than a frozen singleton instance. It is still used the same way; it's just no longer a frozen instance of the class.
##### Added
* setParse method, which allows you to override the instance of the Parse JS SDK used by the module. (By default, the module will try to use the Parse instance from the global scope. If none exists, it will use the node or browser version based on which environment is detected by the 'detect-is-node' module.) If you wish to use the setParse method, do it after you initialize your Parse instance and set the masterKey. (See "Usage" section at the top of this file.)

### Version 3.6.0 - 21st October 2017
##### Added
* getClass method.
* objGetDeep method.
* classStringOrSpecialClass method.
##### Changed
* userHasRole method rejects when passed invalid params
##### Fixed
* Switched test framework from jest to mocha+chai because of issue between jest and parse-mockdb module.

### Version 3.5.4 - 17th October 2017
##### Fixed
* Fixed isPointer method's recognition of one of the 3 different types of pointer objects it checks for.

### Version 3.5.3 - 17th October 2017
##### Fixed
* isPointer method' recognizes 3 different types of pointer objects.
* More thorough tests for isPFObject method, including invalidating pointers.
* More thorough tests for isUser method.

### Version 3.5.2 - 16th October 2017
##### Bug fixes
* isPointer method was restricting to plain objects.

### Version 3.5.2 - 16th October 2017
##### Changes
* Minor jsdoc fixes.

### Version 3.5.0 - 16th October 2017
##### Added
* [fetchIfNeeded](#module_Parsimonious+fetchIfNeeded) method.
* [isPointer](#module_Parsimonious+isPointer) method.

### Version 3.4.0 - 14th October 2017
##### Changes
* Refactored into two files -- one for node environments and one for browsers. Reason: Runtime environment detection is too unreliable, even using "detect-node" module, because of problems running in webpack-dev-server.
* a "browser" option in package.json as a hint to babel, browserify, etc. to use the browser version.

### Version 3.3.0 - 13th October 2017
##### Added
* isUser method

### Version 3.2.0 - 11th October 2017
##### Added
* getUserRoles method returns array of names of user's direct roles.

### Version 3.1.0 - 8rd October 2017
##### Added
* userHasRole method can check if a user has any or all of an array of roles.
##### Changes
* Improved documentation of newQuery method

### Version 3.0.0 - 3rd October 2017
##### BREAKING CHANGES
* getJoinQuery signature has changed: The 'select' parameter has been removed. Instead, set a 'select' key in the 2nd options param object for use by newQuery method.
##### Added
* newQuery method accepts a 'select' key in its 2nd parameter to select fields to restrict results to.
##### Other Changes
* Improved documentation.

### Version 2.0.8 - 22nd September 2017
##### Changes
* Improved ci config.
* Moved Change Log to bottom of README.

### Version 2.0.7 - 21st September 2017
##### Changes
* Removed commitizen.

### Version 2.0.6 - 21st September 2017
##### Changes
* Removed semantic-release for now.

### Version 2.0.5 - 21st September 2017
##### Changes
* Reconfigured ci.

### Version 2.0.4 - 21st September 2017
##### Changes
* codecov reporting and badge.
* Reduced minimum required node version to 4.

### Version 2.0.3 - 21st September 2017
##### Changes
* 100% test coverage with jest.
* Use different branch of parse-shim to account for parse already being loaded in cloud code.

##### Bug Fixed
* Use different branch of parse-shim to correctly detect when running in browser or node to import correct parse version.

### Version 2.0.2 - 20th September 2017
##### Added
* userHasRole method
##### Changes
* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery
##### Breaking Changes
* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to *undefined* instead of null.