  Some things to note:

    3 players: 
      jsonData - raw data from server
      Model    - description of how to convert from jsonData to target JS object
      target   - raw js object (target model) returned from serialize()

    Phase 1: 
      A Model object is instantiated. The jsonData is copied directly into the
      Model. 

      _bindParent property is a json object 'parent' for items in an array property.


    Phase 2:
      Subtrees are converted first. A subtree is a description of properties that
      need to be serialized. The subtree properties might be single objects or 
      arrays. 
````
        <ParentModel> {
          _modelSubtree: {
              <targetPropname>: <PropertyModelClass>
          }
        }

        for example:

        UploadModel {
          _modelSubtree: {
              artist: ArtistModel,   // single object will be created 
              files: FilesModel      // array in json object called 'files'
                                     // becomes an array of js objects that
                                     // serialized using the FilesModel 
                                     // object called 'files'
          }
        }
````
    Phase 3:

      properties that end in 'Binding' on Model are straight across conversions 
      (minus the 'Binding')
````
          Model {
            idBinding: 'upload_id'
          }
````
      says: use 'upload_id' in the json data and make it 'id' on the target js object.

      methods that start with 'get' are run on the Model returning the value of the
      property to be used in the js target object.
````
          Model {
            getSomeProperty: function() {
              // the json data is here in the model
              // during serialization
              return this.json_property + 10;
            }
          }
````
      says: call 'getSomeProperty' and use the result in the js target object for
      a property called 'someProperty' (note camelCasing).

      The js target object is passed as a parameter to the 'get'er method but
      ONLY THE SUBTREE is guaranteed to be fully available. 

````
          Model {
            getFavoriteFiles(target) {
              // 'target' is a partially serialized js object
              // only the subtree properties are stable
              return target.files.map( f => f.isFavorite )
            }
          }
````
      This becomes an array property called 'favoriteFiles' on the target

## API

 serialize omnibus function can be called in two ways:
  
````  
  serialize( {jsonData, model, ctx} )
````

  jsonData is the object you want to serizialize into the shape of the model

  model is derived from the Model class and describes the transformation

  ctx is you user data that will passed in to any get*() method translator

  If jsonData is null this returns a function that takes a single argument 
  (perfect for .then() !) that will serialize the incoming
  result(s) in the model specified. If the incoming
  result is an array, each result will be serialized 
  in place.
      
  If jsonData is not null this will perform the serialization immediately
  If that object is an array, it will serialize each item in place
  and return the array.
      
