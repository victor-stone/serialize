# About
Convert butt-ugly, ancient crufty data shapes into beautifully semantically rich objects of desire.

This library is an easy, direct but powerful and flexible way to import raw JSON data (often from a legacy or 3rd party source) and convert it to your app's native shapes.

You create a convesion map (derived from `Model`) for each object you want to import, then feed the JSON data and the Model to `serialize` to get the data shaped the way you want to see it.

Particuarly useful for when you have multiple incoming formats that you want to normalize into one common shape.

# Install

`npm i serialize-js-model`

# Examples

## Describe the Import

````javascript
import serialize, { Model } from ''serialize-js-model'

class MyModel extends Model {
  describe() {
    
    // Straight mapping:
    // --------------------

    // Use the postfix 'Binding' to create new properties
    // 'binding' and 'price' and use the values in 'OrderUuid'
    // and 'Limit' from the incoming data
    this.idBinding = 'OrderUuid'
    this.priceBinding = 'Limit'

    // Customize import with functions:
    // ------------------------------------

    // Use prefix 'get' to create new properties 'saleDate' and
    // 'type' using the custom functions that reference the old
    // values via 'this'
    
    this.getSaleDate = () => new Date(this.TimeStamp)
    this.getType = () => this.OrderType.replace(/^LIMIT_/,'').toLowerCase()

  }
}

````
**NB** the derivation of Model is *not* the final object being created in the import. It is a class that is executed during the conversion/importing. 

## Invoke 
Local data

````javascript

const jsonData = {
  "OrderUuid": "6a788cef-807e-fffe-b327-f3e76832987c",
  "Limit": 0.00000564,
  "TimeStamp": "2017-12-17T21:25:15.1",
  "OrderType": "LIMIT_SELL"
}

const { id, price, saleDate, type } = serialize(jsonData, MyModel)
````

`Promise`

````javascript
const smartFetch = (url, model) => fetch(url).then(serialize(model))

smartFetch('/myapi/fetch-single-object', MyModel)
  
  .then( ({ id, ticker, price, quanity }) => { ... } )
````

`async`

````javascript
const jsondata = await fetch('/myapi/fetch-single-object')

const ({ id, ticker, price, quanity }) =  serialize(jsondata, MyModel)
````


Importing `Array` is the same syntax as importing single objects

````javascript
smartFetch('/myapi/fetch-array') // <-- SAME AS ABOVE

  .then( myDataShape => { 
     myDataShape.forEach( ({ id, ticker, price, quanity }) => { ... } )
   })
````

## Advanced 


When the JSON has nested arrays or objects use the `._nested` property to describe the nested transformation


````javascript
import { Model } from ''serialize-js-model'

class NestedComments extends Model {
  describe() {
    this.getAuthor = () => someDatabaseLookup(this.user_id)
    this.textBinding = 'comment'
  }
}

export default class OuterTopic extends Model {
  describe() {
    this.idBinding = 'topic_id'
    this.nameBinding = 'topic_ttle'

    this._nested = { // <-- name is significant

      comments: { 
        'topic_comments': NestedComments
      }
    }
  }
}

const serializer = serialize(OuterTopic)

const jsonData = {
  "topic_id": 1234,
  "topic_name": "My Favorite Things",

  "topic_comments": [
      {
        "user_id": 3434,
        "comment": "awesome post!"
      },
      {
        "user_id": 2321,
        "comment": "not spam at all"
      }
  ]
}

const result = serializer(jsonData)

const {
  id,
  name,
  comments
} = result

comments.forEach(comment => {
  const {
    text,
    author
  } = comment
  ...
})
````

When you want the result to have a nested object (from a flat JSON) use `_modelSubtree` to describe the nesting in the outer Model.

Use `_bindParent` property in the nested Model to access properties of the outer object. 


````javascript
class Artist extends Model {
  describe() {
    // When binding to property use quoted string
    displayBinding: '_bindParent.RecordingArtist',

    // when binding to function access through this. 
    getSort: () => {
      const { RecordingArtist } = this._bindParent;
      return RecordingArtist.split(/\s+/).reverse().join(', ');
    }
  }
}

class Track extends Model {
  describe() {
    trackBinding: 'Title',

    _modelSubtree: {
      artist: Artist
    }
  }
}
````
````javascript
const jsonData = [
  {
    "Title": "Purple Haze",
    "RecordingArtist": "Jimi Hendrix"
  },
  {
    "Title": "Revolution",
    "RecordingArtist": "The Beatles"
  }
]

const results = serialize(jsonData, Track)

results.forEach(result => {
  const {
    track,
    artist: {
      display,
      sort
    }
  } = result
  ....

})
````
Use the third parameter to `serialize` to pass in context to every function transformer.

````javascript
class MyModel extends Model {
  describe() {
    this.getUser = (target, ctx) => ctx.db.lookup( this.UserId )
  }
}
````
````javascript
import db from 'my-database-api'

const jsonData = {
  UserId: "`1234FEDC"
}

const { user } = serialize( jsonData, MyModel, { db } )
````
# API

 serialize omnibus function can be called in two ways:
  
````javascript
  const transformedData = serialize( jsonData, model, ctx )

  // OR 

  const curriedSerialize = serialize( model, ctx )

  transformedData = curriedSerialize( jsonData )
````

`jsonData` is the object or array of the data to serizialize into the shape of the model

`model` is derived from the `Model` class and describes the transformation

`ctx` is you user data that will passed in to any get*() method translator

## Model
### Methods

`describe` - derivations implement this to describe the transormation

### Properties

`_modelSubtree` - declare this to describe an object or array nested in the final result

`_bindParent` - access this in a nested `Model` to get access to outer Model's incoming JSON properties

`_nested` - declare this to describe nested objects in the incoming JSON data

 `__preserveCase` - declare this to disable default behavior of changing case of members
    
