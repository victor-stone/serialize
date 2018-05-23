class Model {

  constructor (jsonData, bindParent, ctx) {
    Object.assign(this, jsonData)
    Object.defineProperty(this, '_ctx', {
      value: ctx,
      writable: false
    })
    Object.defineProperty(this, '_bindParent', {
      value: bindParent,
      writable: false
    })
    this.describe()
  }

  /**
   * derivations override this
   */
  describe () {

  }
}

function _serialize ({ jsonData, model, ctx, bindParent }) {

  if (!jsonData) {
    throw new Error('Missing JSON')
  }

  if (Array.isArray(jsonData)) {
    return jsonData.map(data => _serialize({
      jsonData: data,
      model,
      ctx,
      bindParent
    }))
  }

  model = new model(jsonData, bindParent, ctx) // eslint-disable-line new-cap

  var target = {}

  if ('_modelSubtree' in model) {

    let nested = model._modelSubtree

    // _modelSubtree : {
    //    propName: ClassName
    // }
    for (let targetName in nested) {

      target[targetName] = _serialize({
        jsonData: jsonData[targetName] || {},
        model: nested[targetName],
        bindParent: jsonData,
        ctx
      })
    }
  }

  if ('_nested' in model) {

    let nested = model._nested

    for (let targetName in nested) {

      for (var orgName in nested[targetName]) {

        var modelName = nested[targetName][orgName]

        target[targetName] =
          _serialize({
            jsonData: jsonData[orgName] || {},
            model: modelName,
            bindParent: jsonData,
            ctx
          })

      }
    }
  }

  for (var k in model) {

    var boundName = k.match(/^(.*)Binding$/)

    if (boundName !== null) {
      boundName = boundName[1]
      if (!target[boundName]) {
        target[boundName] = pathValue(model, model[k])
      }

    } else if (k.match(/^set/)) {

      target[k] = model[k]

    } else {

      var propName2 = k.match(/^get(.*)$/)

      if (propName2 !== null) {
        var s = propName2[1]
        if (typeof s === 'string') {
          propName2 = (model.__preserveCase
            ? s[0]
            : s[0].toLowerCase()) + s.substr(1)

          target[propName2] = model[k](target, ctx)
        }
      }
    }
  }

  return target
}

function serialize (json = null, model = null, ctx = null) {
  if (Model.isPrototypeOf(json)) {
    ctx = model
    model = json
    return jsonData => _serialize({ jsonData, model, ctx })
  }
  return _serialize({ jsonData: json, model, ctx })
}

function pathValue (obj, propName) {
  var names = propName.split('.')
  var value = obj[names[0]]
  for (var i = 1; i < names.length; i++) {
    value = value[names[i]]
  }
  return value
}

serialize.Model = Model

// all the code above has been replace
// by the code below

serialize.mapper = mapfunc => data => {
  if (Array.isArray(data)) {
    return data.map(mapfunc)
  }
  return mapfunc(data)
}

module.exports = serialize

