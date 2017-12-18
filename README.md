# About
Convert butt-ugly, ancient crufty data shapes into beautifully semantically rich objects of desire.

This library is an easy, direct but powerful and flexible way to import raw JSON data (often from a legacy or 3rd party source) and convert it to your app's native shapes.

You create a convesion map (derived from `Model`) for each object you want to import, then feed the JSON data and the Model to `serialize` to get the data shaped the way you want to see it.

This library is perfect for when you have multiple incoming formats that you want to normalize into one common shape.

# Examples

## Import a simple, single REST object

Boring flacid JSON object
````json
{
  "OrderUuid": "6a788cef-807e-fffe-b327-f3e76832987c",
  "Exchange": "BTC-START",
  "TimeStamp": "2017-12-17T21:25:15.1",
  "OrderType": "LIMIT_SELL",
  "Limit": 0.00000564,
  "Quantity": 895.82308862
}
````

Describe how to convert. In this case we are just renaming some properties:

````javascript
// my-models.js
import { Model } from 'serialize';

class MyImporter extends Model {
  constructor() {
    super(...arguments);

    this.idBinding = 'OrderUuid';
    this.tickerBinding = 'Exchange';
    this.priceBinding = 'Limit';
    this.quantityBinding = 'Quantity';
  }
}
````
Note the derivation of Model is NOT the final object being created in the import. It is a class that is executed during the conversion/importing. 

To get the final imported object described by your Model, call `serialize`. Here we do it on a single object:

````javascript
// fetch-data.js
import serialzie from 'serialize';
import MyModel from './my-model.js';

... 
const myData = serialize( rawJSONData, MyModel );
....
````

 `serialize` works great in Promises

````javascript
fetch('/myapi/fetch-single-object')

  .then( jsonData => serialize(jsonData,MyModel}) )

  .then( ({ id, ticker, price, quanity }) => { ... } )
````

Which you can reduce to:

````javascript
fetch('/myapi/fetch-single-object')
  
  .then( serialize(MyModel) ) // <-- BOOM 
  
  .then( ({ id, ticker, price, quanity }) => { ... } )
````

## Import an array of REST objects
If the data is an array of the same object the `serialize` call looks exactly the same but the return value is an array:


````javascript
fetch('/myapi/fetch-array')
  .then( serialize(MyModel) ) // <-- SAME AS ABOVE
  .then( myDataShape => {    // <-- Results are in an array
    myDataShape.forEach( ({ id, ticker, price, quanity }) => { ... } )
    ....
   } )
````

## Customize importing for each property

Using a function to import:

````javascript

class MyImporter extends Model {
  constructor() {
    super(...arguments);

    this.getSaleDate = () => new Date(this.TimeStamp);
    ...
````
That will generate a property called `saleDate` (<-- camelCasing).

````javascript

const { saleDate } = serialize( jsonData, MyImporter );

````

## Nested Imports

You can map nested object in the original JSON to nested objects into the new shape.

Note this JSON has a nested object ('topic_user') and a nested array ('topic_comments')

````JSON
// json from a fetch from /myapi/topic
{
  "topic_id": 1234,
  "topic_name": "My Favorite Things",

  "topic_user": {
      "user_id": 8989,
      "user_email": "user@example.com"
    },

  "topic_comments": [
      {
        "user_id": 3434,
        "comment": "awesome post!"
      },
      {
        "user_id": 2321,
      ....

````

The outer JSON, the nested user and the comment object nested in the array all get their own import Model:

````javascript
// topic-import-model.js
import { Model } from 'serialize';

class MyNestedModel extends Model {
  constructor() {
    super(...arguments);

    this.authorIdBinding = 'user_id';
    this.emailBinding = 'user_email';
  }
}

class MyNestedArrayElement extends Model {
  constructor() {
    super(...arguments);

    this.commentorBinding = 'user_id';
    this.textBinding = 'comment';
  }
}

class MyOuterModel extends Model {
  constructor() {
    super(...arguments);

    this.idBinding = 'topic_id';
    this.nameBinding = 'topic_title';

    this._nested = { // <-- name is significant

      // this will become a single object shaped by
      // MyUser with the prop name 'author'
      author: { 'topic_user': MyNestedModel },

      // this will become an array shaped by MyComment
      // objects with the prop name 'comments'
      comments: { 'topic_comments': MyNestedArrayElement}
    };    

````

````javascript
fetch('/myapi/topic/4567')
  .then( serialize(MyOuterModel) ) 
  .then( myDataShape => { 
    myDataShape.forEach( ({ id, name, author: { authorId, email} }, comments ) => { 
        comments.forEach( ({ commentor, text }) => { ... })
        ...
    ....
   } )
````

## Create nesting

You can create a nesting from a flat JSON object.

Say your legacy JSON data is flat:

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
````

and you want to import this into a new shape:

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

Use the `_bindParent` property in the nested Model to access properties of the outer object. This makes it easy to resuse the nested Model in several different contexts.

Use `_modelSubtree` to describe the nesting in the outer Model.

````javascript
class Artist extends Model {
  constructor() {
    super(...arguments);

    idDisplay: '_bindParent.RecordingArtist',

    getSort: () => {
      const { RecordingArtist } = this._bindParent;
      return RecordingArtist.split(/\s+/).reverse().join(', ');
    }
  }
}

class Track extends Model {
  constructor() {
    super(...arguments);

    trackBinding: 'Title',

    _modelSubtree: {
      artist: Artist
    }
  }
}
````
# API

 serialize omnibus function can be called in two ways:
  
````javascript
  serialize( jsonData, model, ctx )
````

jsonData is the object you want to serizialize into the shape of the model

model is derived from the Model class and describes the transformation

ctx is you user data that will passed in to any get*() method translator

If jsonData object is an array, it will serialize each item in place and return the array.

````javascript
  serialize( model, ctx )
````
This returns a function that takes a single argument (perfect for .then() !) that will serialize the incoming result(s) in the model specified. If the incoming result is an array, each result will be serialized in place.
      
    
