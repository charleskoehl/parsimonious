## Change Log

### 4.2.1 - 08-11-17
##### Fixed
* README

### 4.2.0 - 08-11-17
##### Added
* Support for calling [joinWithTable](#module_Parsimonious+joinWithTable) with two Parse.Object instances, while still supporting the original parameter format. 
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
* [fetchIfNeeded](#module_Parsimonious+fetchIfNeeded) method.
* [isPointer](#module_Parsimonious+isPointer) method.

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