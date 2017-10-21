'use strict';

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _parseMockdb = require('parse-mockdb');

var _parseMockdb2 = _interopRequireDefault(_parseMockdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_node2.default.initialize('test');

describe('parse-mockdb testing', function () {

  it('should save correctly', function () {
    _parseMockdb2.default.mockDB(); // Mock the Parse RESTController
    var TheObj = _node2.default.Object.extend('TheParseObj'),
        obj = new TheObj();
    obj.save({ message: 'hello' }).then(function (obj) {
      assert.equal(obj.get('message'), 'hello');
      _parseMockdb2.default.cleanUp(); // Clear the Database
      _parseMockdb2.default.unMockDB(); // Un-mock the Parse RESTController
    });
  });
});