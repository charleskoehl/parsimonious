[![buildstatus](https://travis-ci.org/charleskoehl/parsimonious.svg?branch=master)](https://travis-ci.org/charleskoehl/parsimonious)
[![codecov](https://codecov.io/gh/charleskoehl/parsimonious/branch/master/graph/badge.svg)](https://codecov.io/gh/charleskoehl/parsimonious)

[Change Log](#changelog)

<a name="module_Parsimonious"></a>

## Parsimonious
Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.


* [Parsimonious](#module_Parsimonious)
    * [~Parsimonious](#module_Parsimonious..Parsimonious)
        * [.toJsn(thing, [deep])](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
        * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
        * [.objSetMulti(parseObj, dataObj, [doMerge])](#module_Parsimonious..Parsimonious+objSetMulti)
        * [.newQuery(className)](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
        * [.getObjById(className, id, [opts])](#module_Parsimonious..Parsimonious+getObjById)
        * [.getUserById(id, [opts])](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
        * [.userHasRole(user, roleName, [opts])](#module_Parsimonious..Parsimonious+userHasRole) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
        * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
        * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
        * [.joinWithTable(classes, [metadata], [opts])](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
        * [.unJoinWithTable(classes, [opts])](#module_Parsimonious..Parsimonious+unJoinWithTable) ⇒ <code>Promise</code>
        * [.getJoinQuery(classes)](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
        * [.isPFObject(thing, [ofClass])](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>

<a name="module_Parsimonious..Parsimonious"></a>

### Parsimonious~Parsimonious
**Kind**: inner class of [<code>Parsimonious</code>](#module_Parsimonious)  

* [~Parsimonious](#module_Parsimonious..Parsimonious)
    * [.toJsn(thing, [deep])](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
    * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
    * [.objSetMulti(parseObj, dataObj, [doMerge])](#module_Parsimonious..Parsimonious+objSetMulti)
    * [.newQuery(className)](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(className, id, [opts])](#module_Parsimonious..Parsimonious+getObjById)
    * [.getUserById(id, [opts])](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
    * [.userHasRole(user, roleName, [opts])](#module_Parsimonious..Parsimonious+userHasRole) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
    * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
    * [.joinWithTable(classes, [metadata], [opts])](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
    * [.unJoinWithTable(classes, [opts])](#module_Parsimonious..Parsimonious+unJoinWithTable) ⇒ <code>Promise</code>
    * [.getJoinQuery(classes)](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.isPFObject(thing, [ofClass])](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>

<a name="module_Parsimonious..Parsimonious+toJsn"></a>

#### parsimonious.toJsn(thing, [deep]) ⇒ <code>\*</code>
Return a json representation of a Parse.Object,
sub-class of Parse.Object (such as Parse.User),
or plain object containing any or none of those, to json, optionally recursively.
Does not mutate parameters.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| thing | <code>\*</code> |  | Value to create json from. |
| [deep] | <code>boolean</code> | <code>false</code> | If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion. |

<a name="module_Parsimonious..Parsimonious+objPick"></a>

#### parsimonious.objPick(parseObj, keys) ⇒ <code>object</code>
Get some columns from a Parse object and return them in a plain object.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type |
| --- | --- |
| parseObj | <code>Parse.Object</code> | 
| keys | <code>string</code> \| <code>Array.&lt;string&gt;</code> | 

<a name="module_Parsimonious..Parsimonious+objSetMulti"></a>

#### parsimonious.objSetMulti(parseObj, dataObj, [doMerge])
Set some columns on a Parse object. Mutates the Parse object.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parseObj | <code>Parse.Object</code> |  |  |
| dataObj | <code>object</code> |  |  |
| [doMerge] | <code>boolean</code> | <code>false</code> | If true, each column value is shallow-merged with existing value |

<a name="module_Parsimonious..Parsimonious+newQuery"></a>

#### parsimonious.newQuery(className) ⇒ <code>Parse.Query</code>
Return a new Parse.Query instance from a Parse Object class name.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**: <code>object=</code> opts Query restrictions  
**Params**: <code>number=</code> opts.limit Parameter for Parse.Query.limit. Must be integer greater than zero.  
**Params**: <code>number=</code> opts.skip Parameter for Parse.Query.skip. Must be integer greater than zero.  
**Params**: <code>string[]=</code> opts.select Parameter for Parse.Query.select. Restricts the fields of the returned Parse.Objects to include only the provided keys.  

| Param | Type |
| --- | --- |
| className | <code>string</code> | 

<a name="module_Parsimonious..Parsimonious+getObjById"></a>

#### parsimonious.getObjById(className, id, [opts])
Return a Parse.Object instance from className and id.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| className | <code>string</code> |  |
| id | <code>string</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious..Parsimonious+getUserById"></a>

#### parsimonious.getUserById(id, [opts]) ⇒ <code>Parse.User</code>
Return Parse.User instance from user id

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> |  |
| [opts] | <code>object</code> | A A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious..Parsimonious+userHasRole"></a>

#### parsimonious.userHasRole(user, roleName, [opts]) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Parse.User</code> |  |
| roleName | <code>string</code> |  |
| [opts] | <code>object</code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious..Parsimonious+getClassInst"></a>

#### parsimonious.getClassInst(className) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type |
| --- | --- |
| className | <code>string</code> | 

<a name="module_Parsimonious..Parsimonious+getJoinTableName"></a>

#### parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | First class name |
| to | <code>string</code> | Second class name |

<a name="module_Parsimonious..Parsimonious+joinWithTable"></a>

#### parsimonious.joinWithTable(classes, [metadata], [opts]) ⇒ <code>Promise</code>
Join two parse objects in a many-to-many relationship by adding a document to a third join table.
Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
Returns promise.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| classes | <code>object</code> |  | must contain two keys corresponding to existing classes; each value must be a valid parse object. |
| [metadata] | <code>object</code> | <code></code> | optional key/value pairs to set on the new document to describe relationship. |
| [opts] | <code>object</code> | <code></code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious..Parsimonious+unJoinWithTable"></a>

#### parsimonious.unJoinWithTable(classes, [opts]) ⇒ <code>Promise</code>
Unjoin two parse objects currently joined in a many-to-many relationship by a document in a third join table.
Like Parse.Relation.remove (see Parsimonious.joinWithTable above).
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
If can't unjoin objects, returned promise resolves to undefined.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| classes | <code>object</code> |  | must contain two keys corresponding to existing classes;                           each value must be a valid parse object already in db. |
| [opts] | <code>object</code> | <code></code> | A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find). |

<a name="module_Parsimonious..Parsimonious+getJoinQuery"></a>

#### parsimonious.getJoinQuery(classes) ⇒ <code>Parse.Query</code>
Return a query on a many-to-many join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**: <code>object=</code> opts Query restrictions (see Parsimonious.newQuery)  

| Param | Type | Description |
| --- | --- | --- |
| classes | <code>object</code> | must contain two keys corresponding to existing classes, with each key's value being either a valid parse object or null |

<a name="module_Parsimonious..Parsimonious+isPFObject"></a>

#### parsimonious.isPFObject(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default |
| --- | --- | --- |
| thing | <code>\*</code> |  | 
| [ofClass] | <code>string</code> | <code>null</code> | 


<a name="changelog"></a>
## Change Log

### Version 3.0.0 - 3rd October 2017
##### Breaking Changes
* getJoinQuery signature has changed: The 'select' parameter has been removed. Instead, set a 'select' key in the 2nd options param object for use by newQuery method.
##### New Features
* newQuery accepts a 'select' key in its 2nd parameter to select fields to restrict results to.
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
* userHasRole method
##### Updates
* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery
##### Breaking Changes
* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to *undefined* instead of null.