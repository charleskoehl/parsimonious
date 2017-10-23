'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Parsimonious = require('./Parsimonious');

var _Parsimonious2 = _interopRequireDefault(_Parsimonious);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if ((typeof Parse === 'undefined' ? 'undefined' : _typeof(Parse)) === 'object') {
  _Parsimonious2.default.setParse(Parse);
} else {
  _Parsimonious2.default.setParse(require('parse'));
}

exports.default = _Parsimonious2.default;