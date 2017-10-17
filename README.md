[![buildstatus](https://travis-ci.org/charleskoehl/parsimonious.svg?branch=master)](https://travis-ci.org/charleskoehl/parsimonious)
[![codecov](https://codecov.io/gh/charleskoehl/parsimonious/branch/master/graph/badge.svg)](https://codecov.io/gh/charleskoehl/parsimonious)

[Change Log](#changelog)

<a name="module_Parsimonious"></a>

## Parsimonious
Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.


* [Parsimonious](#module_Parsimonious)
    * [.toJsn(thing, [deep])](#module_Parsimonious+toJsn) ⇒ <code>\*</code>
    * [.objPick(parseObj, keys)](#module_Parsimonious+objPick) ⇒ <code>object</code>
    * [.objSetMulti(parseObj, dataObj, [doMerge])](#module_Parsimonious+objSetMulti)
    * [.newQuery(aClass, [opts])](#module_Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(aClass, id, [opts])](#module_Parsimonious+getObjById)
    * [.getUserById(id, [opts])](#module_Parsimonious+getUserById) ⇒ <code>Parse.User</code>
    * [.fetchIfNeeded(thing, [opts])](#module_Parsimonious+fetchIfNeeded) ⇒ <code>Parse.Promise</code> \| <code>\*</code> \| <code>PromiseLike.&lt;T&gt;</code> \| <code>Promise.&lt;T&gt;</code>
    * [.isPointer(thing)](#module_Parsimonious+isPointer) ⇒ <code>boolean</code>
    * [.getUserRoles(user, [opts])](#module_Parsimonious+getUserRoles) ⇒ <code>Parse.Promise</code>
    * [.userHasRole(user, roles, [opts])](#module_Parsimonious+userHasRole) ⇒ <code>Parse.Promise</code>
    * [.getClassInst(className, [attributes], [options])](#module_Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#module_Parsimonious+getJoinTableName) ⇒ <code>string</code>
    * [.joinWithTable(classes, [metadata], [opts])](#module_Parsimonious+joinWithTable) ⇒ <code>Promise</code>
    * [.unJoinWithTable(classes, [opts])](#module_Parsimonious+unJoinWithTable) ⇒ <code>Promise</code>
    * [.getJoinQuery(classes, [opts])](#module_Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.isUser(thing)](#module_Parsimonious+isUser) ⇒ <code>boolean</code>
    * [.isPFObject(thing, [ofClass])](#module_Parsimonious+isPFObject) ⇒ <code>boolean</code>
    * [.getPFObjectClassName(thing)](#module_Parsimonious+getPFObjectClassName) ⇒ <code>string</code>

<a name="module_Parsimonious+toJsn"></a>

### parsimonious.toJsn(thing, [deep]) ⇒ <code>\*</code>
Return a json representation of a Parse.Object,
sub-class of Parse.Object (such as Parse.User),
or plain object containing any or none of those, to json, optionally recursively.
Does not mutate parameters.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>\*</code> |  | Value to create json from. |
| [deep] | <code>boolean</code> | <code>false</code> | If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion. |

<a name="module_Parsimonious+objPick"></a>

### parsimonious.objPick(parseObj, keys) ⇒ <code>object</code>
Get some columns from a Parse object and return them in a plain object.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type |
| --- | --- |
| parseObj | <code>Parse.Object</code> | 
| keys | <code>string</code> \| <code>Array.&lt;string&gt;</code> | 

<a name="module_Parsimonious+objSetMulti"></a>

### parsimonious.objSetMulti(parseObj, dataObj, [doMerge])
Set some columns on a Parse object. Mutates the Parse object.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parseObj | <code>Parse.Object</code> |  |  |
| dataObj | <code>object</code> |  |  |
| [doMerge] | <code>boolean</code> | <code>false</code> | If true, each column value is shallow-merged with existing value |

<a name="module_Parsimonious+newQuery"></a>

### parsimonious.newQuery(aClass, [opts]) ⇒ <code>Parse.Query</code>
Return a new Parse.Query instance from a Parse Object class name.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| aClass | <code>string</code> \| <code>object</code> | class name or constructor |
| [opts] | <code>object</code> | Query restrictions |
| [opts.limit] | <code>number</code> | Parameter for Parse.Query.limit. Must be integer greater than zero. |
| [opts.skip] | <code>number</code> | Parameter for Parse.Query.skip. Must be integer greater than zero. |
| [opts.select] | <code>Array.&lt;string&gt;</code> | Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys. |

<a name="module_Parsimonious+getObjById"></a>

### parsimonious.getObjById(aClass, id, [opts])
Return a Parse.Object instance from className and id.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| aClass | <code>string</code> \| <code>object</code> | class name or constructor |
| id | <code>string</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+getUserById"></a>

### parsimonious.getUserById(id, [opts]) ⇒ <code>Parse.User</code>
Return Parse.User instance from user id

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+fetchIfNeeded"></a>

### parsimonious.fetchIfNeeded(thing, [opts]) ⇒ <code>Parse.Promise</code> \| <code>\*</code> \| <code>PromiseLike.&lt;T&gt;</code> \| <code>Promise.&lt;T&gt;</code>
Given a value thing, return a promise that resolves to
  thing if thing is a clean Parse.Object,
  fetched Parse.Object if thing is a dirty Parse.Object,
  fetched Parse.Object if thing is a pointer;
  thing if otherwise

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  
**Returns**: <code>Parse.Promise</code> \| <code>\*</code> \| <code>PromiseLike.&lt;T&gt;</code> \| <code>Promise.&lt;T&gt;</code> - Promise that fulfills with saved UserPrefs object.  

| Param | Type | Description |
| --- | --- | --- |
| thing | <code>\*</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+isPointer"></a>

### parsimonious.isPointer(thing) ⇒ <code>boolean</code>
Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param |
| --- |
| thing | 

<a name="module_Parsimonious+getUserRoles"></a>

### parsimonious.getUserRoles(user, [opts]) ⇒ <code>Parse.Promise</code>
Return array of names of user's direct roles, or empty array.
Requires that the Roles class has appropriate read permissions.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Parse.User</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+userHasRole"></a>

### parsimonious.userHasRole(user, roles, [opts]) ⇒ <code>Parse.Promise</code>
Check if a user has a role, or any or all of multiple roles, return a promise resolving to true or false.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Parse.User</code> |  |
| roles | <code>string</code> \| <code>object</code> | Can be single role name string, or object containing array of role names and 'op' key of value 'and' or 'or' |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+getClassInst"></a>

### parsimonious.getClassInst(className, [attributes], [options]) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| className | <code>string</code> |  |
| [attributes] | <code>object</code> | Properties to set on new object. |
| [options] | <code>object</code> | Options to use when creating object. |

<a name="module_Parsimonious+getJoinTableName"></a>

### parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | First class name |
| to | <code>string</code> | Second class name |

<a name="module_Parsimonious+joinWithTable"></a>

### parsimonious.joinWithTable(classes, [metadata], [opts]) ⇒ <code>Promise</code>
Join two parse objects in a many-to-many relationship by adding a document to a third join table.
Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
Returns promise.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| classes | <code>object</code> |  | must contain two keys corresponding to existing classes; each value must be a valid parse object. |
| [metadata] | <code>object</code> | <code></code> | optional key/value pairs to set on the new document to describe relationship. |
| [opts] | <code>object</code> |  | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+unJoinWithTable"></a>

### parsimonious.unJoinWithTable(classes, [opts]) ⇒ <code>Promise</code>
Unjoin two parse objects currently joined in a many-to-many relationship by a document in a third join table.
Like Parse.Relation.remove (see Parsimonious.joinWithTable above).
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
If can't unjoin objects, returned promise resolves to undefined.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| classes | <code>object</code> | must contain two keys corresponding to existing classes;                           each value must be a valid parse object already in db. |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious+getJoinQuery"></a>

### parsimonious.getJoinQuery(classes, [opts]) ⇒ <code>Parse.Query</code>
Return a query on a many-to-many join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| classes | <code>object</code> | must contain two keys corresponding to existing classes, with each key's value being either a valid parse object or null |
| [opts] | <code>object</code> | Query restrictions (see Parsimonious.newQuery) |

<a name="module_Parsimonious+isUser"></a>

### parsimonious.isUser(thing) ⇒ <code>boolean</code>
Return true if thing is an instance of Parse.User.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type |
| --- | --- |
| thing | <code>\*</code> | 

<a name="module_Parsimonious+isPFObject"></a>

### parsimonious.isPFObject(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type |
| --- | --- |
| thing | <code>\*</code> | 
| [ofClass] | <code>string</code> | 

<a name="module_Parsimonious+getPFObjectClassName"></a>

### parsimonious.getPFObjectClassName(thing) ⇒ <code>string</code>
Returns valid class-name when passed either a subclass of Parse.Object or any string.
Removes the underscore if it is one of the special classes with a leading underscore.
Returns undefined if anything else.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious)  

| Param | Type |
| --- | --- |
| thing | <code>object</code> \| <code>string</code> | 


<a name="changelog"></a>
## Change Log

### Version 3.5.0 - 16th October 2017
##### New Features
* New [fetchIfNeeded](#module_Parsimonious+fetchIfNeeded) method.
* New [isPointer](#module_Parsimonious+isPointer) method.

### Version 3.4.0 - 14th October 2017
##### Updates
* Refactored into two files -- one for node environments and one for browsers. Reason: Runtime environment detection is too unreliable, even using "detect-node" module, because of problems running in webpack-dev-server.
* Added a "browser" option in package.json as a hint to babel, browserify, etc. to use the browser version.

### Version 3.3.0 - 13th October 2017
##### New Features
* New isUser method because I am sick of typing isPFObject(user, 'User').

### Version 3.3.0 - 13th October 2017
##### New Features
* New isUser method because I am sick of typing isPFObject(user, 'User').

### Version 3.2.0 - 11th October 2017
##### New Features
* New getUserRoles method returns array of names of user's direct roles.

### Version 3.1.0 - 8rd October 2017
##### New Features
* userHasRole method can check if a user has any or all of an array of roles.
##### Updates
* Improved documentation of newQuery method

### Version 3.0.0 - 3rd October 2017
##### Breaking Changes
* getJoinQuery signature has changed: The 'select' parameter has been removed. Instead, set a 'select' key in the 2nd options param object for use by newQuery method.
##### New Features
* newQuery method accepts a 'select' key in its 2nd parameter to select fields to restrict results to.
##### Updates
* Improved documentation.

### Version 2.0.8 - 22nd September 2017
##### Updates
* Improved ci config.
* Moved Change Log to bottom of README.

### Version 2.0.7 - 21st September 2017
##### Updates
* Removed commitizen.

### Version 2.0.6 - 21st September 2017
##### Updates
* Removed semantic-release for now.

### Version 2.0.5 - 21st September 2017
##### Updates
* Reconfigured ci.

### Version 2.0.4 - 21st September 2017
##### Updates
* Added codecov reporting and badge.
* Reduced minimum required node version to 4.

### Version 2.0.3 - 21st September 2017
##### Updates
* 100% test coverage with jest.
* Use different branch of parse-shim to account for parse already being loaded in cloud code.

##### Bug Fixes
* Use different branch of parse-shim to correctly detect when running in browser or node to import correct parse version.

### Version 2.0.2 - 20th September 2017
##### New Features
* new userHasRole method
##### Updates
* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery
##### Breaking Changes
* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to *undefined* instead of null.