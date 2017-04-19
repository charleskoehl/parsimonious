# parsimonious
Utilities for Parse Server cloud code and JS SDK. Imports as a singleton instance.
# Documentation

## `objPick(parseObj, keys)`

Get some columns from a Parse object and return a javascript object

 * **Parameters:**
   * `parseObj` — `Parse.Object` — 
   * `keys` — `(string|string[])` — 
 * **Returns:** `object` — 

## `objSetMulti(parseObj, dataObj, doMerge)`

Set some columns on a Parse object from a javascript object Mutates the Parse object.

 * **Parameters:**
   * `parseObj` — `Parse.Object` — 
   * `dataObj` — `object` — 
   * `doMerge` — `bool` — - if true, each column value is shallow-merged with existing value

## `toJsn(parseObj)`

Return Parse.Object converted to JSON, or null if no Parse object passed.

 * **Parameters:** `parseObj` — `Parse.Object` — 
 * **Returns:** `object` — 

## `newQuery(className)`

Return a new Parse.Query instance from a Parse Object class name

 * **Parameters:** `className` — `string` — 
 * **Returns:** `Parse.Query` — 

## `getObjById(className, id, useMasterKey)`

Return a Parse.Object instance from className and id

 * **Parameters:**
   * `className` — `string` — 
   * `id` — `string` — 
   * `useMasterKey` — `bool` — - cloud code only

## `getUserById(id, useMasterKey)`

Return Parse.User instance from user id

 * **Parameters:**
   * `id` — `string` — 
   * `useMasterKey` — `bool` — - cloud code only
 * **Returns:** `Parse.User` — 

## `isPFObject(thing)`

Return true if thing is a Parse.Object or subclass of Parse.Object

 * **Parameters:** `thing` — `*` — 
 * **Returns:** `boolean` — 
 
---
Special thanks to [Csaba Tuncsik](https://github.com/cstuncsik) for his [es6-node-module-boilerplate](https://github.com/cstuncsik/es6-node-module-boilerplate)