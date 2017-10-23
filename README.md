[![buildstatus](https://travis-ci.org/charleskoehl/parsimonious.svg?branch=master)](https://travis-ci.org/charleskoehl/parsimonious)
[![codecov](https://codecov.io/gh/charleskoehl/parsimonious/branch/master/graph/badge.svg)](https://codecov.io/gh/charleskoehl/parsimonious)

## Usage
#### Basic:
```javascript
const parsm = require('parsimonious')
const CoolThing = parsm.getClassInst('CoolThing', {color: 'Red'})
```
#### Override the Parse instance used:
```
// Initialize Parse JS SDK first:
Parse.initialize('myAppId')
Parse.masterKey = 'myMasterKey'

// Initialize parsimonious with the initialized Parse instance:
const parsm = require('parsimonious')
parsm.setParse(Parse)

// Call the methods:
const CoolThing = parsm.getClassInst('CoolThing', {color: 'Red'})
```

<a name="module_Parsimonious"></a>

## Parsimonious
Utilities for Parse Server cloud code and JS SDK. Exports a singleton instance.


[Change Log](#changelog)

<a name="changelog"></a>
## Change Log

### Version 3.7.0 - 22nd October 2017
##### Non-Breaking Change:
* Exports a class with static methods, rather than a frozen singleton instance. It is still used the same way; it's just no longer a frozen instance of the class.
##### New Feature:
* Added setParse method, which allows you to override the instance of the Parse JS SDK used by the module. (By default, the module will try to use the Parse instance from the global scope. If none exists, it will use the node or browser version based on which environment is detected by the 'detect-is-node' module.) If you which to use the setParse method, do it after you initialize your Parse instance and set the masterKey. (See "Usage" section at the top of this file.)

### Version 3.6.0 - 21st October 2017
##### New Features
* Added getClass method.
* Added objGetDeep method.
* Added classStringOrSpecialClass method.
##### Improvements
* userHasRole method rejects when passed invalid params
##### Fixes
* Switched test framework from jest to mocha+chai because of issue between jest and parse-mockdb module.

### Version 3.5.4 - 17th October 2017
##### Fixes
* Fixed isPointer method's recognition of one of the 3 different types of pointer objects it checks for.

### Version 3.5.3 - 17th October 2017
##### Fixes
* isPointer method' recognizes 3 different types of pointer objects.
* More thorough tests for isPFObject method, including invalidating pointers.
* More thorough tests for isUser method.

### Version 3.5.2 - 16th October 2017
##### Bug fixes
* isPointer method was restricting to plain objects.

### Version 3.5.2 - 16th October 2017
##### Updates
* Minor jsdoc fixes.

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