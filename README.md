# About
A single mechanism for objects and arrays that convert butt-ugly, ancient crufty data shapes into beautifully semantically rich objects of desire.

Hot Buzzwords: functional, currying, data-last

# Install

`npm i serialize-js-model`

# Usage

````javascript
import { mapper } from 'serialize-js-model'

const mymapper = 
  ({ ID: id, User: userId }) =>
    ({ id, userId, context: `imported` })

const curriedMapper = mapper(mymapper)

fetch(url)
  .then(curriedMapper)
  .then(data => ...)

// works on single objects ('auto-box's)

const oldRecord = {
  ID: 123,
  User: 984
}

const newData = curriedMapper(oldRecord)

// also arrays 

const oldRecords = [
  { ID: 123, User: 999 },
  { ID: 124, User: 998 },
  { ID: 125, User: 996 },
  { ID: 126, User: 995 }
]

const newRecords = curriedMapper(oldRecords)

````
