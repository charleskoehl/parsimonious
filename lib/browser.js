'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Parsimonious = require('./Parsimonious');

var _Parsimonious2 = _interopRequireDefault(_Parsimonious);

var _parse = require('parse');

var _parse2 = _interopRequireDefault(_parse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Object.freeze(new _Parsimonious2.default(_parse2.default));