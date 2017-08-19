import Model from './model';

function _serialize({jsonData,model,ctx,bindParent}) {

  if( !jsonData ) {
    throw new Error( "Missing JSON" );
  }

  if( Array.isArray(jsonData) ) {
    return jsonData.map( data => _serialize( { jsonData:data, 
                                                model,
                                                ctx,
                                                bindParent
                                              }) );
  }

  model = new model(jsonData,bindParent,ctx);

  var target = {};

  if( '_modelSubtree' in model ) {

      var subTree = model._modelSubtree;

      for( var propName in subTree ) {

        target[propName] = _serialize( { jsonData:jsonData[propName] || {}, 
                                         model:subTree[propName], 
                                         bindParent:jsonData, 
                                         ctx 
                                       });
      }
  }


  for( var k in model ) {

    var boundName = k.match(/^(.*)Binding$/);

    if( boundName !== null ) {
      boundName = boundName[1];
      if( !target[boundName] ) {
        target[boundName] = pathValue( model, model[k] );
      }

    } else if( k.match(/^set/) ) {

      target[k] = model[k];
      
    } else {

        var propName2 = k.match(/^get(.*)$/);

        if( propName2 !== null ) {
          var s = propName2[1];
          if( typeof s === 'string' ) {
            propName2 = s[0].toLowerCase() + s.substr(1);

            target[propName2] = model[k](target,ctx);
          }
        }
    }
  }
    
  return target;
}


function serialize({jsonData=null,model=null,ctx=null}) {
  if( jsonData === null ) {
    return jsonData => _serialize({jsonData,model,ctx})
  }
  return _serialize({jsonData,model,ctx});
}

serialize.Model = Model;

module.exports = serialize;

function pathValue(obj, propName) {
  var names = propName.split('.');
  var value = obj[names[0]];
  for( var i = 1; i < names.length; i++ ) {
    value = value[names[i]];
  }
  return value;
}


