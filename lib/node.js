'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Parsimonious = require('./Parsimonious');

var _Parsimonious2 = _interopRequireDefault(_Parsimonious);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Object.freeze(new _Parsimonious2.default(_node2.default));