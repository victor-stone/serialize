const assert = require('assert')
const serialize = require('../dist')

const { mapper } = serialize

if (typeof describe === 'undefined') {

} else {
  describe('Serialize Tests', function () {
    it('should produce single object', function () {
      const data = {
        F: 1,
        G: 2
      }
      const mymapper = mapper(({ F: f, G: g }) => ({ f, g }))
      const result = mymapper(data)
      const expected = '{"f":1,"g":2}'
      assert.equal(JSON.stringify(result), expected)
    })
    it('should produce single array', function () {
      const data = [{
        F: 1,
        G: 2
      }]
      const mymapper = mapper(({ F: f, G: g }) => ({ f, g }))
      const result = mymapper(data)
      const expected = '[{"f":1,"g":2}]'
      assert.equal(JSON.stringify(result), expected)
    })
  })
}
