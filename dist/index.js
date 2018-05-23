'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function () {
  function Model(jsonData, bindParent, ctx) {
    _classCallCheck(this, Model);

    Object.assign(this, jsonData);
    Object.defineProperty(this, '_ctx', {
      value: ctx,
      writable: false
    });
    Object.defineProperty(this, '_bindParent', {
      value: bindParent,
      writable: false
    });
    this.describe();
  }

  /**
   * derivations override this
   */


  _createClass(Model, [{
    key: 'describe',
    value: function describe() {}
  }]);

  return Model;
}();

function _serialize(_ref) {
  var jsonData = _ref.jsonData,
      model = _ref.model,
      ctx = _ref.ctx,
      bindParent = _ref.bindParent;


  if (!jsonData) {
    throw new Error('Missing JSON');
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(function (data) {
      return _serialize({
        jsonData: data,
        model: model,
        ctx: ctx,
        bindParent: bindParent
      });
    });
  }

  model = new model(jsonData, bindParent, ctx); // eslint-disable-line new-cap

  var target = {};

  if ('_modelSubtree' in model) {

    var nested = model._modelSubtree;

    // _modelSubtree : {
    //    propName: ClassName
    // }
    for (var targetName in nested) {

      target[targetName] = _serialize({
        jsonData: jsonData[targetName] || {},
        model: nested[targetName],
        bindParent: jsonData,
        ctx: ctx
      });
    }
  }

  if ('_nested' in model) {

    var _nested = model._nested;

    for (var _targetName in _nested) {

      for (var orgName in _nested[_targetName]) {

        var modelName = _nested[_targetName][orgName];

        target[_targetName] = _serialize({
          jsonData: jsonData[orgName] || {},
          model: modelName,
          bindParent: jsonData,
          ctx: ctx
        });
      }
    }
  }

  for (var k in model) {

    var boundName = k.match(/^(.*)Binding$/);

    if (boundName !== null) {
      boundName = boundName[1];
      if (!target[boundName]) {
        target[boundName] = pathValue(model, model[k]);
      }
    } else if (k.match(/^set/)) {

      target[k] = model[k];
    } else {

      var propName2 = k.match(/^get(.*)$/);

      if (propName2 !== null) {
        var s = propName2[1];
        if (typeof s === 'string') {
          propName2 = (model.__preserveCase ? s[0] : s[0].toLowerCase()) + s.substr(1);

          target[propName2] = model[k](target, ctx);
        }
      }
    }
  }

  return target;
}

function serialize() {
  var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var ctx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (Model.isPrototypeOf(json)) {
    ctx = model;
    model = json;
    return function (jsonData) {
      return _serialize({ jsonData: jsonData, model: model, ctx: ctx });
    };
  }
  return _serialize({ jsonData: json, model: model, ctx: ctx });
}

function pathValue(obj, propName) {
  var names = propName.split('.');
  var value = obj[names[0]];
  for (var i = 1; i < names.length; i++) {
    value = value[names[i]];
  }
  return value;
}

serialize.Model = Model;

// all the code above has been replace
// by the code below

serialize.mapper = function (mapfunc) {
  return function (data) {
    if (Array.isArray(data)) {
      return data.map(mapfunc);
    }
    return mapfunc(data);
  };
};

module.exports = serialize;

