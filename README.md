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
import serialize, { Model } from 'serialize'

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


### Handle nested JSON

````JSON
// json from a fetch from /myapi/topic
{
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
````

See the `._nested` property.

````javascript
// topic-import-model.js
import { Model } from 'serialize'

class NestedComments extends Model {
  async describe() {
    this.getAuthor= () => await someDatabaseLookup(this.user_id)
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

````

Meanwhile in JSX

````javascript

import OuterTopic from './topic-import-model'

const serializer = serialize(OuterTopic)

class MyComponent {

  async componentWillMount() {
    fetch( '/myapi/topic/' + this.props.topicId )
      .then( serializer )
      .then( data => this.setState({ data }) )
  }

  render () {
    return <div className="comments">
      {this.state.data.map(({ id, name, comments }) => 
        <div key={id}>
          <div>{name}</div>
          <ul>
            {comments.map(({ author, text }, index) => 
              <li key={index}>{`${text} says ${author}`}</li>)}
          </ul>
        </div>
      })
    </div>
  }
}


## Create nesting from flat JSON

````JSON
[
  {
    "Title": "Purple Haze",
    "RecordingArtist": "Jimi Hendrix"
  },
  {
    "Title": "Revolution",
    "RecordingArtist": "The Beatles"
  }
]
````

Use `_bindParent` property in the nested Model to access properties of the outer object. 

````javascript
class Artist extends Model {
  describe() {
    idDisplay: '_bindParent.RecordingArtist',

    getSort: () => {
      const { RecordingArtist } = this._bindParent;
      return RecordingArtist.split(/\s+/).reverse().join(', ');
    }
  }
}
````

Use `_modelSubtree` to describe the nesting in the outer Model.

````javascript
class Track extends Model {
  describe() {
    trackBinding: 'Title',

    _modelSubtree: {
      artist: Artist
    }
  }
}
````

Result:
````javascript
[
  {
    track: 'Purple Haze',
    artist: {
      display: 'Jimi Hendrix',
      sort: 'Hendrix, Jimi'
    }
  },
  {
    track: 'Revolution',
    artist: {
      display: 'The Beatles',
      sort: 'Beatles, The'
    }
  }
]
````

# API

 serialize omnibus function can be called in two ways:
  
````javascript
  const transformedData = serialize( jsonData, model, ctx )
````

`jsonData` is the object you want to serizialize into the shape of the model

`model` is derived from the `Model` class and describes the transformation

`ctx` is you user data that will passed in to any get*() method translator

````javascript
class MyModel extends Model {
  describe() {
    this.getUser = ctx => ctx.db.lookup(this.UserName)
  }
}

const { user } = serialize(jsonData, MyModel, { db })

````

If jsonData object is an array, it will serialize each item in place and return the array.

Alternate calling syntax:
````javascript
  const reusableFunc = serialize( model, ctx )
````
This returns a function that takes a single argument (perfect for `.then()`) that will serialize the incoming result(s) in the model specified. If the incoming result is an array, each result will be serialized in place.
````javascript
const rec = reusableFunc(jsonData)
````
      
    
