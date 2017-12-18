import Model from './model';

function _serialize({ jsonData, model, ctx, bindParent }) {

  if (!jsonData) {
    throw new Error("Missing JSON");
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(data => _serialize({
      jsonData: data,
      model,
      ctx,
      bindParent
    }));
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
        ctx
      });
    }
  }

  if ('_nested' in model) {

    var nested = model._nested;

    for (var targetName in nested) {

      for (var orgName in nested[targetName]) {

        var modelName = nested[targetName][orgName];

        target[targetName] =
          _serialize({
            jsonData: jsonData[orgName] || {},
            model: modelName,
            bindParent: jsonData,
            ctx
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
          propName2 = s[0].toLowerCase() + s.substr(1);

          target[propName2] = model[k](target, ctx);
        }
      }
    }
  }

  return target;
}


function serialize(json = null, model = null, ctx = null) {
  if (model === null) {
    model = json;
    return jsonData => _serialize({ jsonData, model, ctx })
  }
  return _serialize({ jsonData:json, model, ctx });
}

serialize.Model = Model;

module.exports = serialize;

function pathValue(obj, propName) {
  var names = propName.split('.');
  var value = obj[names[0]];
  for (var i = 1; i < names.length; i++) {
    value = value[names[i]];
  }
  return value;
}


