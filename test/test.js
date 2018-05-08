const assert = require('assert')
const serialize = require('../dist')

const { Model } = serialize

const jsonData = {
  foo: 'fee',
  bar: 100,
  n: 'victor',
  sons: {
    nestme: 'zach',
    nestme2: 'michael'
  },
  arr: [
    { parent: 'susan' },
    { parent: 'alex' },
    { parent: 'charlie' }
  ]
}

class Me extends Model {
  describe () {
    this.nameBinding = '_bindParent.n'
  }
}

class Sons extends Model {
  describe () {
    this.son1Binding = 'nestme'
    this.son2Binding = 'nestme2'
  }
}

const genderNameMap = {
  susan: 'leans toward female',
  alex: 'could be any',
  charlie: 'leans toward male'
}

class Parent extends Model {

  describe () {

    this.nameBinding = 'parent'
    this.getGender = () => genderNameMap[this.parent] || 'unknown'
  }
}

class MyModel extends Model {

  describe () {

    this.__preserveCase = true

    this.idBinding = 'foo'

    this.getUUID = () => this.bar * 2

    this._modelSubtree = {
      me: Me
    }

    this._nested = {
      kids: { sons: Sons },
      parents: { arr: Parent }
    }

    this.getpatriarchy = () => this.arr.filter(({parent}) => genderNameMap[parent] === 'leans toward male')
  }
}

const jsonData1 = {
  'raw': 'data'
}

const transformer = str => str.toUpperCase()

class TestModel1 extends Model {
  describe () {
    this.getYelling = (target, ctx) => ctx.transformer(this.raw)
  }
}

const jsonData2 = {
  'raw': 'data2'
}

class TestModel2 extends Model {
  describe () {
    this.selectBinding = 'raw'
  }
}

if (typeof describe === 'undefined') {
  const func = serialize(TestModel2)
  const result = func(jsonData2)
  assert.equal(result.select, jsonData2.raw)
} else {
  describe('Serialize Tests', function () {
    it('should produce string', function () {
      const result = serialize(jsonData, MyModel)
      const expected = '{"me":{"name":"victor"},"kids":{"son1":"zach","son2":"michael"},"parents":[{"name":"susan","gender":"leans toward female"},{"name":"alex","gender":"could be any"},{"name":"charlie","gender":"leans toward male"}],"id":"fee","UUID":200,"patriarchy":[{"parent":"charlie"}]}'
      assert.equal(JSON.stringify(result), expected)
    })

    it('should pass context', function () {
      const result = serialize(jsonData1, TestModel1, { transformer })
      assert.equal(result.yelling, 'DATA')
    })

    it('should make function', function () {
      const func = serialize(TestModel2)
      const result = func(jsonData2)
      assert.equal(result.select, jsonData2.raw)
    })

    it('should make function with context', function () {
      const func = serialize(TestModel1, { transformer })
      const result = func(jsonData1)
      assert.equal(result.yelling, 'DATA')
    })

  })

}
