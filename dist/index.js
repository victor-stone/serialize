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
      return _serialize({
        jsonData: data,
        model: model,
        ctx: ctx,
        bindParent: bindParent
      });
    });
  }

  model = new model(jsonData, bindParent, ctx);

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

    var nested = model._nested;

    for (var targetName in nested) {

      for (var orgName in nested[targetName]) {

        var modelName = nested[targetName][orgName];

        target[targetName] = _serialize({
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

  if (model === null) {
    model = json;
    return function (jsonData) {
      return _serialize({ jsonData: jsonData, model: model, ctx: ctx });
    };
  }
  return _serialize({ jsonData: json, model: model, ctx: ctx });
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

