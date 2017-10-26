## Change Log

### Version 4.0.0 - 26th October 2017
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

### Version 3.7.6 - 3.7.7 - 23rd October 2017
##### Changed
* Minor README changes, but published in order to get NPM to show the last few updates to README.

### Version 3.7.5 - 23rd October 2017
##### Changed
* Minor jsdoc fixes.

### Version 3.7.4 - 23rd October 2017
##### Fixes
* Uses 'browser' field in package.json to hint to webpack, browserify to substitute 'parse' for 'parse/node'

### Versions 3.7.1 - 3.7.3 - 22nd October 2017
##### Changed
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
* The way isPointer recognizes of one of the 3 different types of pointer objects it checks for.

### Version 3.5.3 - 17th October 2017
##### Changed
* isPointer method' recognizes 3 different types of pointer objects.
* More thorough tests for isPFObject method, including invalidating pointers.
* More thorough tests for isUser method.

### Version 3.5.2 - 16th October 2017
##### Bug fixes
* isPointer method was restricting to plain objects.

### Version 3.5.2 - 16th October 2017
##### Changed
* Minor jsdoc fixes.

### Version 3.5.0 - 16th October 2017
##### Added
* [fetchIfNeeded](#module_Parsimonious+fetchIfNeeded) method.
* [isPointer](#module_Parsimonious+isPointer) method.

### Version 3.4.0 - 14th October 2017
##### Changed
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
##### Changed
* Improved documentation of newQuery method

### Version 3.0.0 - 3rd October 2017
##### BREAKING CHANGES
* getJoinQuery signature has changed: The 'select' parameter has been removed. Instead, set a 'select' key in the 2nd options param object for use by newQuery method.
##### Added
* newQuery method accepts a 'select' key in its 2nd parameter to select fields to restrict results to.
##### Other Changed
* Improved documentation.

### Version 2.0.8 - 22nd September 2017
##### Changed
* Improved ci config.
* Moved Change Log to bottom of README.

### Version 2.0.7 - 21st September 2017
##### Changed
* Removed commitizen.

### Version 2.0.6 - 21st September 2017
##### Changed
* Removed semantic-release for now.

### Version 2.0.5 - 21st September 2017
##### Changed
* Reconfigured ci.

### Version 2.0.4 - 21st September 2017
##### Changed
* codecov reporting and badge.
* Reduced minimum required node version to 4.

### Version 2.0.3 - 21st September 2017
##### Changed
* 100% test coverage with jest.
* Use different branch of parse-shim to account for parse already being loaded in cloud code.

##### Bug Fixed
* Use different branch of parse-shim to correctly detect when running in browser or node to import correct parse version.

### Version 2.0.2 - 20th September 2017
##### Added
* userHasRole method
##### Changed
* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery
##### Breaking Changed
* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to *undefined* instead of null.