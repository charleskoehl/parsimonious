# Change Log

## Version 2.0.0 - 20th September 2017

### New Features

* userHasRole method

### Updates

* all methods that access the database now accept optional sessionToken
* isPFObject now accepts an optional class name param
* can pass array of field names, in addition to comma-separated list, to getJoinQuery

### Breaking Changes

* If unJoinWithTable can't unjoin objects, it returns a promise that resolves to undefined instead of null.