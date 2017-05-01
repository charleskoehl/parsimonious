<a name="module_Parsimonious"></a>

## Parsimonious
Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.


* [Parsimonious](#module_Parsimonious)
    * [~Parsimonious](#module_Parsimonious..Parsimonious)
        * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
        * [.objSetMulti(parseObj, dataObj, doMerge)](#module_Parsimonious..Parsimonious+objSetMulti)
        * [.toJsn(obj, deep)](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
        * [.newQuery(className)](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
        * [.getObjById(className, id, useMasterKey)](#module_Parsimonious..Parsimonious+getObjById)
        * [.getUserById(id, useMasterKey)](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
        * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
        * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
        * [.joinWithTable(classes, [metadata], useMasterKey)](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
        * [.getJoinQuery(classes, [selects])](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
        * [.isPFObject(thing)](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>

<a name="module_Parsimonious..Parsimonious"></a>

### Parsimonious~Parsimonious
**Kind**: inner class of [<code>Parsimonious</code>](#module_Parsimonious)  

* [~Parsimonious](#module_Parsimonious..Parsimonious)
    * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
    * [.objSetMulti(parseObj, dataObj, doMerge)](#module_Parsimonious..Parsimonious+objSetMulti)
    * [.toJsn(obj, deep)](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
    * [.newQuery(className)](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(className, id, useMasterKey)](#module_Parsimonious..Parsimonious+getObjById)
    * [.getUserById(id, useMasterKey)](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
    * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
    * [.joinWithTable(classes, [metadata], useMasterKey)](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
    * [.getJoinQuery(classes, [selects])](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.isPFObject(thing)](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>

<a name="module_Parsimonious..Parsimonious+objPick"></a>

#### parsimonious.objPick(parseObj, keys) ⇒ <code>object</code>
Get some columns from a Parse object and return a javascript object

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- keys <code>string</code> | <code>Array.&lt;string&gt;</code>

<a name="module_Parsimonious..Parsimonious+objSetMulti"></a>

#### parsimonious.objSetMulti(parseObj, dataObj, doMerge)
Set some columns on a Parse object from a javascript object
Mutates the Parse object.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- dataObj <code>object</code>
- doMerge <code>bool</code> - If true, each column value is shallow-merged with existing value

<a name="module_Parsimonious..Parsimonious+toJsn"></a>

#### parsimonious.toJsn(obj, deep) ⇒ <code>\*</code>
Convert object to json map, whether it is an instance or subclass instance of Parse.Object,
or a plain object that might contain instances or subclass instances of Parse.Object's.
Has no effect on plain objects unless deep == true.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- obj <code>object</code> | <code>Parse.Object</code>
- deep <code>bool</code> <code> = false</code>

<a name="module_Parsimonious..Parsimonious+newQuery"></a>

#### parsimonious.newQuery(className) ⇒ <code>Parse.Query</code>
Return a new Parse.Query instance from a Parse Object class name

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- className <code>string</code>

<a name="module_Parsimonious..Parsimonious+getObjById"></a>

#### parsimonious.getObjById(className, id, useMasterKey)
Return a Parse.Object instance from className and id

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- className <code>string</code>
- id <code>string</code>
- useMasterKey <code>bool</code> - Cloud code only

<a name="module_Parsimonious..Parsimonious+getUserById"></a>

#### parsimonious.getUserById(id, useMasterKey) ⇒ <code>Parse.User</code>
Return Parse.User instance from user id

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- id <code>string</code>
- useMasterKey <code>bool</code> - Cloud code only

<a name="module_Parsimonious..Parsimonious+getClassInst"></a>

#### parsimonious.getClassInst(className) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- className <code>string</code>

<a name="module_Parsimonious..Parsimonious+getJoinTableName"></a>

#### parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- from <code>string</code> - First class name
- to <code>string</code> - Second class name

<a name="module_Parsimonious..Parsimonious+joinWithTable"></a>

#### parsimonious.joinWithTable(classes, [metadata], useMasterKey) ⇒ <code>Promise</code>
Join two parse objects by adding a document to a third join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- classes <code>object</code> - must contain two keys corresponding to existing classes; each value must be a valid parse object.
- [metadata] <code>object</code> - optional key/value pairs to set on the new document to describe relationship.
- useMasterKey <code>bool</code> <code> = false</code>

<a name="module_Parsimonious..Parsimonious+getJoinQuery"></a>

#### parsimonious.getJoinQuery(classes, [selects]) ⇒ <code>Parse.Query</code>
Return a query on a join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- classes <code>object</code> - must contain two keys corresponding to existing classes; at least one value must be a valid parse object; the other may be a valid parse object or null.
- [selects] <code>string</code> - comma-separated list of keys to retrieve

<a name="module_Parsimonious..Parsimonious+isPFObject"></a>

#### parsimonious.isPFObject(thing) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**

- thing <code>\*</code>

 
* * *

Special thanks to [Csaba Tuncsik](https://github.com/cstuncsik) for his [es6-node-module-boilerplate](https://github.com/cstuncsik/es6-node-module-boilerplate)