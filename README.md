[![buildstatus](https://travis-ci.org/charleskoehl/parsimonious.svg?branch=master)](https://travis-ci.org/charleskoehl/parsimonious)
[![codecov](https://codecov.io/gh/charleskoehl/parsimonious/branch/master/graph/badge.svg)](https://codecov.io/gh/charleskoehl/parsimonious)

## Utilities for Parse Server cloud code and JS SDK

#### Usage example: creating and saving parse objects
```javascript
const parsm = require('parsimonious')

const course = await parsm.getClassInst('Course', {
  name: 'Sociology 201'
}).save()

const student = await parsm.getClassInst('Student', {
  name: 'Maria',
  class: 2020
}).save()
```

#### Usage example: many-to-many relationships with metadata
```
/*
Create a many-to-many relationship between students and courses,
and record the fact that a student completed a course,
with date of completion and grade earned:
*/

const meta = {completed: new Date(2017, 11, 17), grade: 3.2}

const opts = {sessionToken: 'r:cbd9ac93162d0ba1287970fb85d8d168'}

const joinObj = await parsm.joinWithTable(student, course, meta, opts)

// joinObj is now an instance of the class 'Student2Course',
// which was created if it didn't exist.
// The Student2Course class has pointer columns 'student' and 'course',
// plus a date column named 'completed' and a numeric column named 'grade'.


/*
Find the top 10 students who have taken a particular course
and earned a grade of at least 3:
*/

const classes = {
   Student: null,
   Course: course
}

const criteria = {
  descending: 'grade',
  greaterThanOrEqualTo: ['grade', 3],
  limit: 10
}

parsm.getJoinQuery(classes, criteria).find()
```
#### Override the Parse instance used:
```javascript
// Initialize Parse JS SDK first:
Parse.initialize('myAppId')
Parse.masterKey = 'myMasterKey'

// Initialize parsimonious with the initialized Parse instance:
const parsm = require('parsimonious')
parsm.setParse(Parse)
```

[Change Log](#changelog)

<a name="Parsimonious"></a>

## Parsimonious
**Kind**: global class  

* [Parsimonious](#Parsimonious)
    
    * [.setParse(parse)](#Parsimonious.setParse)
    * [.newQuery(aClass, [constraints])](#Parsimonious.newQuery) ⇒ <code>Parse.Query</code>
    * [.constrainQuery(query, constraints)](#Parsimonious.constrainQuery) ⇒ <code>Parse.Query</code>
    * [.getObjById(aClass, id, [opts])](#Parsimonious.getObjById)
    * [.getUserById(id, [opts])](#Parsimonious.getUserById) ⇒ <code>Parse.User</code>
    * [.getPFObject([thing], [className], [opts])](#Parsimonious.getPFObject) ⇒ <code>Parse.Promise</code>
    * [.fetchIfNeeded(thing, [opts])](#Parsimonious.fetchIfNeeded) ⇒ <code>Parse.Promise</code>
    * [.getUserRoles(user, [opts])](#Parsimonious.getUserRoles) ⇒ <code>Parse.Promise</code>
    * [.userHasRole(user, roles, [opts])](#Parsimonious.userHasRole) ⇒ <code>Parse.Promise</code>
    * [.getClass(className)](#Parsimonious.getClass) ⇒
    * [.getClassInst(className, [attributes], [options])](#Parsimonious.getClassInst) ⇒ <code>Parse.Object</code>
    * [.getJoinTableName(from, to)](#Parsimonious.getJoinTableName) ⇒ <code>string</code>
    * [._getJoinTableClassVars()](#Parsimonious._getJoinTableClassVars) ⇒ <code>object</code>
    * [.joinWithTable(object1, object2, [metadata], [opts])](#Parsimonious.joinWithTable) ⇒ <code>Parse.Promise</code>
    * [.unJoinWithTable(object1, object2, [opts])](#Parsimonious.unJoinWithTable) ⇒ <code>Parse.Promise</code>
    * [.getJoinQuery(classes, [constraints])](#Parsimonious.getJoinQuery) ⇒ <code>Parse.Query</code>
    * [.getPointer(className, objectId)](#Parsimonious.getPointer) ⇒ <code>object</code>
    * [.isPFObject(thing, [ofClass])](#Parsimonious.isPFObject) ⇒ <code>boolean</code>
    * [.isArrayOfPFObjects(thing, [ofClass])](#Parsimonious.isArrayOfPFObjects) ⇒ <code>boolean</code>
    * [.isPointer(thing, [ofClass])](#Parsimonious.isPointer) ⇒ <code>boolean</code>
    * [.isPFObjectOrPointer(thing, [ofClass])](#Parsimonious.isPFObjectOrPointer) ⇒ <code>boolean</code>
    * [.isUser(thing)](#Parsimonious.isUser) ⇒ <code>boolean</code>
    * [.pfObjectMatch(thing1, thing2)](#Parsimonious.pfObjectMatch) ⇒ <code>boolean</code>
    * [.toJsn(thing, [deep])](#Parsimonious.toJsn) ⇒ <code>\*</code>
    * [.getId(thing)](#Parsimonious.getId) ⇒ <code>string</code> \| <code>undefined</code>
    * [.objPick(parseObj, keys)](#Parsimonious.objPick) ⇒ <code>object</code>
    * [.objGetDeep(parseObj, path)](#Parsimonious.objGetDeep) ⇒ <code>\*</code>
    * [.objSetMulti(parseObj, dataObj, [doMerge])](#Parsimonious.objSetMulti)
    * [.sortPFObjectsByKey([objs], key)](#Parsimonious.sortPFObjectsByKey)
    * [.copyPFObjectAttributes(from, to, attributeNames)](#Parsimonious.copyPFObjectAttributes)
    * [.getPFObjectClassName(thing)](#Parsimonious.getPFObjectClassName) ⇒ <code>string</code>
    * [.classStringOrSpecialClass(thing)](#Parsimonious.classStringOrSpecialClass) ⇒ <code>\*</code>
    * [.classNameToParseClassName(className)](#Parsimonious.classNameToParseClassName)
    * [._toArray(thing, [type])](#Parsimonious._toArray) ⇒ <code>array</code>

<a name="new_Parsimonious_new"></a>


Utilities for Parse Server cloud code and JS SDK.

<a name="Parsimonious.setParse"></a>

### Parsimonious.setParse(parse)
Set the instance of the Parse JS SDK to be used by all methods:

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parse <code>object</code> - instance of the Parse JS SDK

<a name="Parsimonious.newQuery"></a>

### Parsimonious.newQuery(aClass, [constraints]) ⇒ <code>Parse.Query</code>
Returns a new Parse.Query instance from a Parse Object class name.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- aClass <code>Parse.Object</code> | <code>string</code> - Parse class instance or name
- [constraints] <code>object</code> - Plain object whose keys may be any Parse.Query constraint methods and whose values are arrays of arguments for those methods.

**Example**  
```js
// Generate a new Parse.Query on the User class,

const query = Parsimonious.newQuery('User')

// which is equivalent to:

const query = new Parse.Query(Parse.User)
```
**Example**  
```js
// Generate a new Parse.Query on a custom class,

const query = Parsimonious.newQuery('Company')

// which is equivalent to:

const Company = Parse.Object.extend('Company')
const query = new Parse.Query(Company)
```
**Example**  
```js
// Generate a new Parse.Query on the User class, adding constraints 'startsWith,' 'limit,' and 'select.' (See Parsimonious.constrainQuery for constraints parameter details.)

const query = Parsimonious.newQuery('Company', {
  startsWith: ['name', 'tar'],
  limit: 10, // If there is only one argument, does not need to be in an array
  select: [ ['name', 'address', 'url'] ] // If any argument for a constraint is an array, it must be passed to constrainQuery within another array to indicate that its array items are not individual arguments.
})

// which is equivalent to:

const Company = Parse.Object.extend('Company')
const query = new Parse.Query(Company)
query.startsWith('name', 'tar')
query.limit(10)
query.select('name')
query.select('address')
query.select('url')
```
<a name="Parsimonious.constrainQuery"></a>

### Parsimonious.constrainQuery(query, constraints) ⇒ <code>Parse.Query</code>
Calls one or more query constraint methods on a query with arbitrary number of arguments for each method.
This method is useful when, for example, building a complex query configuration to pass to another function that may modify the configuration further and then generate the actual query.
Mutates the 'query' parameter because it calls constraint methods on it.
Returns the query, so you can chain this call.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- query <code>Parse.Query</code> - The query on which to call the constraint methods
- constraints <code>object</code> - Plain object containing query constraint methods as keys and arguments as values

**Example**  
```js
// Modify a query with startsWith, limit, select, equalTo, and notEqualTo constraints:

const query = Parsimonious.newQuery('User')
const constraints = {
  startsWith: ['name', 'Sal'],
  limit: 10, // If there is only one argument, does not need to be in an array
  select: [ ['name', 'email', 'birthDate'] ], // If a single constraint argument is an array, it must be within another array to indicate that its items are not individual arguments.
  equalTo: [ ['gender', 'f'], ['country', 'US'] ], // An array of 2 or more arrays indicates that the constraint method should be called once with each inner array as its arguments.
  notEqualTo: ['company', 'IBM'] // There is just one set of parameters, so there is no need to enclose in another array.
}
Parsimonious.constrainQuery(query, constraints)

// which is equivalent to:

const query = new Parse.Query(Parse.User)
query.startsWith('name', 'Sal')
query.limit(10)
query.select('name')
query.select('email')
query.select('birthDate')
```
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

<a name="Parsimonious.getPFObject"></a>

### Parsimonious.getPFObject([thing], [className], [opts]) ⇒ <code>Parse.Promise</code>
Resolves thing to a Parse.Object, or attempts to retrieve from db if a pointer.
Resolves as undefined otherwise.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- [thing] <code>Parse.Object</code> | <code>object</code> | <code>string</code>
- [className] <code>string</code> - If set, and first param is a Parse.Object, resolves to the Parse.Object only if it is of this class.
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.fetchIfNeeded"></a>

### Parsimonious.fetchIfNeeded(thing, [opts]) ⇒ <code>Parse.Promise</code>
Given a value thing, return a promise that resolves to
- thing if thing is a clean Parse.Object,
- fetched Parse.Object if thing is a dirty Parse.Object,
- fetched Parse.Object if thing is a pointer;
- thing if otherwise

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
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
Short-hand for Parse.Object.extend(className) or a special class like Parse.User

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Returns**: subclass of Parse.Object  
**Params**

- className <code>string</code>

<a name="Parsimonious.getClassInst"></a>

### Parsimonious.getClassInst(className, [attributes], [options]) ⇒ <code>Parse.Object</code>
Return instance of Parse.Object class.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- className <code>string</code> - Parse.Object subclass name.
- [attributes] <code>object</code> - Properties to set on new object.
- [options] <code>object</code> - Options to use when creating object.

<a name="Parsimonious.getJoinTableName"></a>

### Parsimonious.getJoinTableName(from, to) ⇒ <code>string</code>
Return the name of a table used to join two Parse.Object classes in a many-to-many relationship.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- from <code>string</code> - First class name
- to <code>string</code> - Second class name

<a name="Parsimonious._getJoinTableClassVars"></a>

### Parsimonious._getJoinTableClassVars() ⇒ <code>object</code>
Converts a variable number of arguments into 4 variables used by the joinWithTable, unJoinWithTable, getJoinQuery methods.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
<a name="Parsimonious.joinWithTable"></a>

### Parsimonious.joinWithTable(object1, object2, [metadata], [opts]) ⇒ <code>Parse.Promise</code>
Join two parse objects in a many-to-many relationship by adding a document to a third join table.
Like Parse.Relation.add except that it allows you to add metadata to describe the relationship.
Creates join tables which are named with the class names separated with the numeral 2; e.g.: Student2Course.
(For backwards-compatibility with v4.1.0, this method may still be called with the 3 parameters
'classes', 'metadata', and 'opts', where 'classes' is a plain object whose two keys are the classes to join,
and whose values are the Parse.Object instances.)

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- object1 <code>Parse.Object</code> - Parse object or pointer
- object2 <code>Parse.Object</code> - Parse object or pointer
- [metadata] <code>object</code> - optional key/value pairs to set on the new document to describe relationship.
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

**Example**  
```js
// Record the fact that a student completed a course, with date of completion and grade earned:
const student = <instance of Parse.Student subclass>
const course = <instance of Parse.Course subclass>
const meta = {completed: new Date(2017, 11, 17), grade: 3.2}
const opts = {sessionToken: 'r:cbd9ac93162d0ba1287970fb85d8d168'}
Parsimonious.joinWithTable(student, course, meta, opts)
   .then(joinObj => {
     // joinObj is now an instance of the class 'Student2Course', which was created if it didn't exist.
     // The Student2Course class has pointer columns 'student' and 'course',
     // plus a date column named 'completed' and a numeric column named 'grade'.
   })
```
<a name="Parsimonious.unJoinWithTable"></a>

### Parsimonious.unJoinWithTable(object1, object2, [opts]) ⇒ <code>Parse.Promise</code>
Unjoin two parse objects previously joined by Parsimonious.joinWithTable
If can't unjoin objects, returned promise resolves to undefined.
(For backwards-compatibility with v4.1.0, this method may still be called with the 2 parameters
'classes' and 'opts', where 'classes' is a plain object whose two keys are the classes to join,
and whose values are the Parse.Object instances.)

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- object1 <code>Parse.Object</code> - Parse object or pointer
- object2 <code>Parse.Object</code> - Parse object or pointer
- [opts] <code>object</code> - A Backbone-style options object for Parse subclass methods that read/write to database. (See Parse.Query.find).

<a name="Parsimonious.getJoinQuery"></a>

### Parsimonious.getJoinQuery(classes, [constraints]) ⇒ <code>Parse.Query</code>
Return a query on a many-to-many join table created by Parsimonious.joinWithTable.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- classes <code>object</code> - Must contain two keys corresponding to existing classes. At least one key's value must be a valid parse object. If the other key's value is not a valid parse object, the query retrieves all objects of the 2nd key's class that are joined to the object of the 1st class. Same for vice-versa. If both values are valid parse objects, then the query should return zero or one row from the join table.
- [constraints] <code>object</code> - (Options for Parsimonious.newQuery})

**Example**  
```js
// Find the join table record linking a particular student and course together:
const classes = {
   Student: <instance of Student class>,
   Course: <instance of Course class>
}
Parsimonious.getJoinQuery(classes)
   .first()
   .then(joinObj => {
     // joinObj is the instance of the class 'Student2Course'
     // that was created by Parsimonious.joinWithTable}
     // to link that particular student and course together,
     // along with any metadata describing the relationship.
   })
```
**Example**  
```js
// Find all courses taken by a particular student:
const classes = {
   Student: <instance of Student class>,
   Course: null
}
Parsimonious.getJoinQuery(classes)
   .find()
   .then(joinObjs => {
     // joinObj is an array of instances of the class 'Student2Course'
     // that were created by Parsimonious.joinWithTable}.
   })
```
**Example**  
```js
// Find the top 10 students who have taken a particular course and received a grade of at least 3:
const classes = {
   Student: null,
   Course: <instance of Course class>
}
Parsimonious.getJoinQuery(classes, {
   descending: 'grade',
   greaterThanOrEqualTo: ['grade', 3],
   limit: 10
}).find()
```
<a name="Parsimonious.getPointer"></a>

### Parsimonious.getPointer(className, objectId) ⇒ <code>object</code>
Return a pointer to a Parse.Object.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- className <code>string</code>
- objectId <code>string</code>

<a name="Parsimonious.isPFObject"></a>

### Parsimonious.isPFObject(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object, or sub-class of Parse.Object (like Parse.User or Parse.MyCustomClass)

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [ofClass] <code>string</code> - Optionally check if it's of a specific ParseObjectSubclass

<a name="Parsimonious.isArrayOfPFObjects"></a>

### Parsimonious.isArrayOfPFObjects(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is array of Parse.Object

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [ofClass] <code>string</code> - Optionally check if it's of a specific ParseObjectSubclass

<a name="Parsimonious.isPointer"></a>

### Parsimonious.isPointer(thing, [ofClass]) ⇒ <code>boolean</code>
Return true of thing is a valid pointer to a Parse.Object, regardless of whether the Parse.Object exists.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [ofClass] <code>string</code> - Optionally check if it's of a specific ParseObjectSubclass

<a name="Parsimonious.isPFObjectOrPointer"></a>

### Parsimonious.isPFObjectOrPointer(thing, [ofClass]) ⇒ <code>boolean</code>
Return true if thing is a Parse.Object or pointer

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [ofClass] <code>string</code> - Optionally check if it's of a specific ParseObjectSubclass

<a name="Parsimonious.isUser"></a>

### Parsimonious.isUser(thing) ⇒ <code>boolean</code>
Return true if thing is an instance of Parse.User.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>

<a name="Parsimonious.pfObjectMatch"></a>

### Parsimonious.pfObjectMatch(thing1, thing2) ⇒ <code>boolean</code>
Return true if values both represent the same Parse.Object instance (same class and id) even if one is a pointer and the other is a Parse.Object instance.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing1 <code>Parse.Object</code> | <code>object</code>
- thing2 <code>Parse.Object</code> | <code>object</code>

<a name="Parsimonious.toJsn"></a>

### Parsimonious.toJsn(thing, [deep]) ⇒ <code>\*</code>
Return a json representation of a Parse.Object,
or of plain object that may contain Parse.Object instances,
optionally recursively.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code> - Value to create json from.
- [deep] <code>boolean</code> <code> = false</code> - If true, recursively converts all Parse.Objects and sub-classes of Parse.Objects contained in any plain objects found or created during recursion.

<a name="Parsimonious.getId"></a>

### Parsimonious.getId(thing) ⇒ <code>string</code> \| <code>undefined</code>
Attempt to return the ID of thing if it's a Parse.Object or pointer.
If thing is a string, just return it.
Otherwise, return undefined.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>

<a name="Parsimonious.objPick"></a>

### Parsimonious.objPick(parseObj, keys) ⇒ <code>object</code>
Get some columns from a Parse object and return them in a plain object.
If keys is not an array or comma-separated string, return undefined.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- keys <code>string</code> | <code>Array.&lt;string&gt;</code>

**Example**  
```js
const car = new Parse.Object.extend('Car')

car.set('type', 'SUV')
car.set('interior', {
  seats:5,
  leather: {
    color: 'tan',
    seats: true,
    doors: false
  }
})
car.set('specs', {
  length: 8,
  height: 4,
  performance: {
    speed: 120,
    zeroTo60: 6
  }
})

Parsimonious.objPick(car, 'type,interior.leather,specs.performance.speed')
// returns
 {
   type: 'SUV',
   interior: {
     leather: {
      color: 'tan',
      seats: true,
     doors: false
   },
   specs: {
     performance: {
       speed: 120
     }
   }
 }
```
<a name="Parsimonious.objGetDeep"></a>

### Parsimonious.objGetDeep(parseObj, path) ⇒ <code>\*</code>
Get the value of a key from a Parse object and return the value of a nested key within it.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- path <code>string</code> - Dot-notation path whose first segment is the column name.

**Example**  
```js
const car = new Parse.Object.extend('Car')
car.set('type', 'SUV')
car.set('interior', {
  seats:5,
  leather: {
    color: 'tan',
    seats: true,
    doors: false
  }
})
Parsimonious.objGetDeep(car, 'interior.leather.color')
// returns "tan"
```
<a name="Parsimonious.objSetMulti"></a>

### Parsimonious.objSetMulti(parseObj, dataObj, [doMerge])
Set some columns on a Parse object.
Mutates the Parse object.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- parseObj <code>Parse.Object</code>
- dataObj <code>object</code>
- [doMerge] <code>boolean</code> <code> = false</code> - If true, each column value is shallow-merged with existing value

<a name="Parsimonious.sortPFObjectsByKey"></a>

### Parsimonious.sortPFObjectsByKey([objs], key)
Sort an array of Parse objects by key (column name)
Mutates array.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- [objs] <code>Array.&lt;object&gt;</code>
- key <code>string</code>

<a name="Parsimonious.copyPFObjectAttributes"></a>

### Parsimonious.copyPFObjectAttributes(from, to, attributeNames)
Copy a set of attributes from one instance of Parse.Object to another.
Mutates target Parse.Object.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- from <code>Parse.Object</code>
- to <code>Parse.Object</code> - Is mutated.
- attributeNames <code>string</code> | <code>Array.&lt;string&gt;</code>

<a name="Parsimonious.getPFObjectClassName"></a>

### Parsimonious.getPFObjectClassName(thing) ⇒ <code>string</code>
Returns valid class name when passed either a subclass of Parse.Object or any string.
Removes the underscore if it is one of the special classes with a leading underscore.
Returns undefined if anything else.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>object</code> | <code>string</code>

<a name="Parsimonious.classStringOrSpecialClass"></a>

### Parsimonious.classStringOrSpecialClass(thing) ⇒ <code>\*</code>
Returns the corresponding special Parse class (like 'User') if passed the name of one; otherwise, returns the value unchanged.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>string</code>

<a name="Parsimonious.classNameToParseClassName"></a>

### Parsimonious.classNameToParseClassName(className)
If className represents one of the special classes like 'User,' return prefixed with an underscore.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- className

<a name="Parsimonious._toArray"></a>

### Parsimonious._toArray(thing, [type]) ⇒ <code>array</code>
Return thing if array, string[] if string, otherwise array with thing as only item, even if undefined.

**Kind**: static method of [<code>Parsimonious</code>](#Parsimonious)  
**Params**

- thing <code>\*</code>
- [type] <code>string</code> - If set, only include values of this type in resulting array.


<a name="changelog"></a>
## Change Log

### 4.4.1 - 24-11-17
##### Fixed
* minor documentation errors

### 4.4.0 - 24-11-17
##### Added
* copyPFObjectAttributes method
* pfObjectMatch method
* getId method
* isPFObjectOrPointer method
* getPFObject method
* sortPFObjectsByKey method
* isArrayOfPFObjects method
##### Changed
* isPFObject method now checks for ParseObjectSubclass constructor as well as instanceOf Parse.Object
* constrainQuery and getJoinQuery methods now accept multiple constraints of the same type, such as three equalTo's.
* getJoinQuery can now be passed pointers.
* TypeError is now thrown when invalid parameters are passed to getJoinQuery, joinWithTable, unJoinWithTable methods.
* Switched testing platform from Mocha/Chai to Jest.
* Switched testing version of mongodb from parse-mockdb to mongodb-memory-server.

### 4.3.3 - 11-11-17
##### Changed
* Remove links from change log as I can't get jsdoc-to-markdown to generate them correctly.

### 4.3.1 - 4.3.2 - 11-11-17
##### Fixed
* README

### 4.3.0 - 11-11-17
##### Added
* constrainQuery method, which newQuery now uses for optional constraints.
##### Changed
* newQuery method now supports all query constraints (instead of just limit, skip, select and include).

### 4.2.1 - 08-11-17
##### Fixed
* README

### 4.2.0 - 08-11-17
##### Added
* Support for calling joinWithTable with two Parse.Object instances, while still supporting the original parameter format. 
* Examples for join-table methods.
##### Changed
* Improved some other documentation.

### 4.1.0 - 05-11-17
##### Fixed
* getPointer method was generating pseudo pointers that did not have a fetch function.
* Addressed deprecation notice for the mocha "compilers" option
##### Added
* Added optional 'ofClass' param to isPointer method to check if it is a pointer of a specific class.
* 'include' option to newQuery method
* Added support for getting nested values from pointer columns to objGetDeep method.

### 4.0.1 - 26-10-17
##### (trying to get NPM to update README)

### 4.0.0 - 26-10-17
##### BREAKING CHANGES
* getClass method now creates constructors for special classes 'User,' 'Role,' and 'Session' with 'Parse[<special class name>],' but still creates constructors for custom classes with 'Parse.Object.extend(<custom class name>).'
* getClass method now throws a TypeError if not passed a string, which it should have done anyway.
* The above changes to getClass method affect getClassInst method because it always uses getClass method.
* The above changes to getClass method affect newQuery method because it uses getClass method when passed a string.
* Added back 'use strict'
##### Fixed
* getUserById was passing the Parse.User constructor rather than an instance of Parse.User to getObjById, which was then trying to use it in a Parse.Query, but Parse.Query requires class instances or names.
##### Added
* getPointer method
* sample code for objGetDeep

### 3.7.6 - 3.7.7 - 23-10-17
##### Changed
* Minor README changes, but published in order to get NPM to show the last few updates to README.

### 3.7.5 - 23-10-17
##### Changed
* Minor jsdoc fixes.

### 3.7.4 - 23-10-17
##### Fixes
* Uses 'browser' field in package.json to hint to webpack, browserify to substitute 'parse' for 'parse/node'

### Versions 3.7.1 - 3.7.3 - 22-10-17
##### Changed
* Minor README changes

### 3.7.0 - 22-10-17
##### Non-Breaking Change:
* Exports a class with static methods, rather than a frozen singleton instance. It is still used the same way; it's just no longer a frozen instance of the class.
##### Added
* setParse method, which allows you to override the instance of the Parse JS SDK used by the module. (By default, the module will try to use the Parse instance from the global scope. If none exists, it will use the node or browser based on which environment is detected by the 'detect-is-node' module.) If you wish to use the setParse method, do it after you initialize your Parse instance and set the masterKey. (See "Usage" section at the top of this file.)

### 3.6.0 - 21-10-17
##### Added
* getClass method.
* objGetDeep method.
* classStringOrSpecialClass method.
##### Changed
* userHasRole method rejects when passed invalid params
##### Fixed
* Switched test framework from jest to mocha+chai because of issue between jest and parse-mockdb module.

### 3.5.4 - 17-10-17
##### Fixed
* The way isPointer recognizes of one of the 3 different types of pointer objects it checks for.

### 3.5.3 - 17-10-17
##### Changed
* isPointer method' recognizes 3 different types of pointer objects.
* More thorough tests for isPFObject method, including invalidating pointers.
* More thorough tests for isUser method.

### 3.5.2 - 16-10-17
##### Bug fixes
* isPointer method was restricting to plain objects.

### 3.5.2 - 16-10-17
##### Changed
* Minor jsdoc fixes.

### 3.5.0 - 16-10-17
##### Added
* fetchIfNeeded method.
* isPointer method.

### 3.4.0 - 14-10-17
##### Changed
* Refactored into two files -- one for node environments and one for browsers. Reason: Runtime environment detection is too unreliable, even using "detect-node" module, because of problems running in webpack-dev-server.
* a "browser" option in package.json as a hint to babel, browserify, etc. to use the browser version.

### 3.3.0 - 13-10-17
##### Added
* isUser method

### 3.2.0 - 11-10-17
##### Added
* getUserRoles method returns array of names of user's direct roles.

### 3.1.0 - 08-10-17
##### Added
* userHasRole method can check if a user has any or all of an array of roles.
##### Changed
* Improved documentation of newQuery method

### 3.0.0 - 03-10-17
##### BREAKING CHANGES
* getJoinQuery signature has changed: The 'select' parameter has been removed. Instead, set a 'select' key in the 2nd options param object for use by newQuery method.
##### Added
* newQuery method accepts a 'select' key in its 2nd parameter to select fields to restrict results to.
##### Other Changed
* Improved documentation.

### 2.0.8 - 22-09-17
##### Changed
* Improved ci config.
* Moved Change Log to bottom of README.

### 2.0.7 - 21-09-17
##### Changed
* Removed commitizen.

### 2.0.6 - 21-09-17
##### Changed
* Removed semantic-release for now.

### 2.0.5 - 21-09-17
##### Changed
* Reconfigured ci.

### 2.0.4 - 21-09-17
##### Changed
* codecov reporting and badge.
* Reduced minimum required node to 4.

### 2.0.3 - 21-09-17
##### Changed
* 100% test coverage with jest.
* Use different branch of parse-shim to account for parse already being loaded in cloud code.

##### Bug Fixed
* Use different branch of parse-shim to correctly detect when running in browser or node to import correct parse version.

### 2.0.2 - 20-09-17
##### Added
* userHasRole method
##### Changed
* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery
##### Breaking Changed
* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to *undefined* instead of null.