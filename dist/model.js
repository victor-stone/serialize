"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  See ./serialize
*/

var Model = function () {
  function Model(jsonData, bindParent, ctx) {
    _classCallCheck(this, Model);

    Object.assign(this, jsonData);
    this._bindParent = bindParent;
    this._ctx = ctx;
    this.describe();
  }

  /**
   * derivations override this
   */


  _createClass(Model, [{
    key: "describe",
    value: function describe() {}
  }]);

  return Model;
}();

module.exports = Model;

