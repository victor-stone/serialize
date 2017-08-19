"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  See ./serialize
*/

var Model = function Model(jsonData, bindParent, ctx) {
  _classCallCheck(this, Model);

  Object.assign(this, jsonData);
  this._bindParent = bindParent;
  this._ctx = ctx;
};

module.exports = Model;

