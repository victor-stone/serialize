'use strict';

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _serialize(_ref) {
  var jsonData = _ref.jsonData,
      model = _ref.model,
      ctx = _ref.ctx,
      bindParent = _ref.bindParent;


  if (!jsonData) {
    throw new Error("Missing JSON");
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(function (data) {
      return _serialize({ jsonData: data,
        model: model,
        ctx: ctx,
        bindParent: bindParent
      });
    });
  }

  model = new model(jsonData, bindParent, ctx);

  var target = {};

  if ('_modelSubtree' in model) {

    var subTree = model._modelSubtree;

    for (var propName in subTree) {

      target[propName] = _serialize({ jsonData: jsonData[propName] || {},
        model: subTree[propName],
        bindParent: jsonData,
        ctx: ctx
      });
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
          propName2 = s[0].toLowerCase() + s.substr(1);

          target[propName2] = model[k](target, ctx);
        }
      }
    }
  }

  return target;
}

function serialize(_ref2) {
  var _ref2$jsonData = _ref2.jsonData,
      jsonData = _ref2$jsonData === undefined ? null : _ref2$jsonData,
      _ref2$model = _ref2.model,
      model = _ref2$model === undefined ? null : _ref2$model,
      _ref2$ctx = _ref2.ctx,
      ctx = _ref2$ctx === undefined ? null : _ref2$ctx;

  if (jsonData === null) {
    return function (jsonData) {
      return _serialize({ jsonData: jsonData, model: model, ctx: ctx });
    };
  }
  return _serialize({ jsonData: jsonData, model: model, ctx: ctx });
}

serialize.Model = _model2.default;

module.exports = serialize;

function pathValue(obj, propName) {
  var names = propName.split('.');
  var value = obj[names[0]];
  for (var i = 1; i < names.length; i++) {
    value = value[names[i]];
  }
  return value;
}

