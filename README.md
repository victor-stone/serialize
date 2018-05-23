# About
A single mechanism for objects and arrays that convert butt-ugly, ancient crufty data shapes into beautifully semantically rich objects of desire.

Hot Buzzwords: functional, currying, data-last

# Install

`npm i serialize-js-model`

# Usage

````javascript
import { mapper } from 'serialize-js-model'

const myMapper = 
  ({ ID: id, User: userId }) =>
    ({ id, userId, context: `imported` })

const curriedMapper = mapper(myMapper)

fetch(url)
  .then(curriedMapper)
  .then(({ id, userId, context}) => ...)

// works on single objects

const oldObject = {
  ID: 123,
  User: 984
}

const newObject = curriedMapper(oldObject)

// also arrays 

const oldRecords = [
  { ID: 123, User: 999 },
  { ID: 124, User: 998 },
  { ID: 125, User: 996 },
  { ID: 126, User: 995 }
]

const newRecords = curriedMapper(oldRecords)

````
