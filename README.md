<a name="module_Parsimonious"></a>

## Parsimonious
Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.


* [Parsimonious](#module_Parsimonious)
    * [~Parsimonious](#module_Parsimonious..Parsimonious)
        * [.toJsn(thing, [deep])](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
        * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
        * [.objSetMulti(parseObj, dataObj, [doMerge])](#module_Parsimonious..Parsimonious+objSetMulti)
        * [.newQuery(className, [opts])](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
        * [.getObjById(className, id, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+getObjById)
        * [.getUserById(id, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
        * [.userHasRole(user, roleName, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+userHasRole) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
        * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
        * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
        * [.joinWithTable(classes, [metadata], [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
        * [.unJoinWithTable(classes, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+unJoinWithTable) ⇒ <code>Promise</code>
        * [.getJoinQuery(classes, [select])](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
        * [.isPFObject(thing, [ofClass])](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>
        * [._getMkStOpts([useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+_getMkStOpts) ⇒ <code>object</code> \| <code>null</code>

<a name="module_Parsimonious..Parsimonious"></a>

### Parsimonious~Parsimonious
**Kind**: inner class of [<code>Parsimonious</code>](#module_Parsimonious)  

* [~Parsimonious](#module_Parsimonious..Parsimonious)
    * [.toJsn(thing, [deep])](#module_Parsimonious..Parsimonious+toJsn) ⇒ <code>\*</code>
    * [.objPick(parseObj, keys)](#module_Parsimonious..Parsimonious+objPick) ⇒ <code>object</code>
    * [.objSetMulti(parseObj, dataObj, [doMerge])](#module_Parsimonious..Parsimonious+objSetMulti)
    * [.newQuery(className, [opts])](#module_Parsimonious..Parsimonious+newQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(className, id, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+getObjById)
    * [.getUserById(id, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+getUserById) ⇒ <code>Parse.User</code>
    * [.userHasRole(user, roleName, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+userHasRole) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
    * [.getClassInst(className)](#module_Parsimonious..Parsimonious+getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#module_Parsimonious..Parsimonious+getJoinTableName) ⇒ <code>string</code>
    * [.joinWithTable(classes, [metadata], [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+joinWithTable) ⇒ <code>Promise</code>
    * [.unJoinWithTable(classes, [useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+unJoinWithTable) ⇒ <code>Promise</code>
    * [.getJoinQuery(classes, [select])](#module_Parsimonious..Parsimonious+getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.isPFObject(thing, [ofClass])](#module_Parsimonious..Parsimonious+isPFObject) ⇒ <code>boolean</code>
    * [._getMkStOpts([useMasterKey], [sessionToken])](#module_Parsimonious..Parsimonious+_getMkStOpts) ⇒ <code>object</code> \| <code>null</code>

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

#### parsimonious.newQuery(className, [opts]) ⇒ <code>Parse.Query</code>
Return a new Parse.Query instance from a Parse Object class name.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| className | <code>string</code> |  |
| [opts] | <code>object</code> | Options: skip, limit |

<a name="module_Parsimonious..Parsimonious+getObjById"></a>

#### parsimonious.getObjById(className, id, [useMasterKey], [sessionToken])
Return a Parse.Object instance from className and id.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| className | <code>string</code> |  |  |
| id | <code>string</code> |  |  |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> | <code>null</code> |  |

<a name="module_Parsimonious..Parsimonious+getUserById"></a>

#### parsimonious.getUserById(id, [useMasterKey], [sessionToken]) ⇒ <code>Parse.User</code>
Return Parse.User instance from user id

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  |  |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> |  |  |

<a name="module_Parsimonious..Parsimonious+userHasRole"></a>

#### parsimonious.userHasRole(user, roleName, [useMasterKey], [sessionToken]) ⇒ <code>Promise.&lt;TResult&gt;</code> \| <code>Parse.Promise</code>
**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| user | <code>Parse.User</code> |  |  |
| roleName | <code>string</code> |  |  |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> |  |  |

<a name="module_Parsimonious..Parsimonious+getClassInst"></a>

#### parsimonious.getClassInst(className) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type |
| --- | --- |
| className | <code>string</code> | 

<a name="module_Parsimonious..Parsimonious+getJoinTableName"></a>

#### parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | First class name |
| to | <code>string</code> | Second class name |

<a name="module_Parsimonious..Parsimonious+joinWithTable"></a>

#### parsimonious.joinWithTable(classes, [metadata], [useMasterKey], [sessionToken]) ⇒ <code>Promise</code>
Join two parse objects by adding a document to a third join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.
Returns promise.
If can't join objects, returned promise resolves to undefined.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| classes | <code>object</code> |  | must contain two keys corresponding to existing classes; each value must be a valid parse object. |
| [metadata] | <code>object</code> | <code></code> | optional key/value pairs to set on the new document to describe relationship. |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> | <code>null</code> |  |

<a name="module_Parsimonious..Parsimonious+unJoinWithTable"></a>

#### parsimonious.unJoinWithTable(classes, [useMasterKey], [sessionToken]) ⇒ <code>Promise</code>
Unjoin two parse objects currently joined by a document in a third join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must exist and have pointer columns named like class names,
except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| classes | <code>object</code> |  | must contain two keys corresponding to existing classes;                           each value must be a valid parse object already in db. |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> | <code>null</code> |  |

<a name="module_Parsimonious..Parsimonious+getJoinQuery"></a>

#### parsimonious.getJoinQuery(classes, [select]) ⇒ <code>Parse.Query</code>
Return a query on a join table.
Join table must be named <ClassName1>2<ClassName2>; e.g.: Employee2Company.
Join table must have pointer columns named like class names except first letter lower-case; e.g.: employee, company.

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  
**Params**: <code>object=</code> opts Options: skip, limit  

| Param | Type | Description |
| --- | --- | --- |
| classes | <code>object</code> | must contain two keys corresponding to existing classes;                           each value must be either a valid parse object or null |
| [select] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | comma-separated list, or array, of keys to retrieve |

<a name="module_Parsimonious..Parsimonious+isPFObject"></a>

#### parsimonious.isPFObject(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User)

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default |
| --- | --- | --- |
| thing | <code>\*</code> |  | 
| [ofClass] | <code>string</code> | <code>null</code> | 

<a name="module_Parsimonious..Parsimonious+_getMkStOpts"></a>

#### parsimonious._getMkStOpts([useMasterKey], [sessionToken]) ⇒ <code>object</code> \| <code>null</code>
Return a plain object containing one of the following:
   null
   {userMasterKey: true}
   {sessionToken: <string>}

**Kind**: instance method of [<code>Parsimonious</code>](#module_Parsimonious..Parsimonious)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [useMasterKey] | <code>boolean</code> | <code>false</code> | Cloud code only |
| [sessionToken] | <code>string</code> | <code>null</code> |  |

 
* * *

Special thanks to [Csaba Tuncsik](https://github.com/cstuncsik) for his [es6-node-module-boilerplate](https://github.com/cstuncsik/es6-node-module-boilerplate)