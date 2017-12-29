const serialize = require('./dist');

const { Model } = serialize;

const oldData = {
  foo: 'fee',
  bar: 100,
  n: 'victor',
  sons: {
    nestme: 'zach',
    nestme2: 'michael'  
  },
  arr: [
    { parent: 'susan' },
    { parent: 'alex'},
    { parent: 'charlie' }
  ]
};

class Me extends Model {
  describe() {
    this.nameBinding = '_bindParent.n';
  }
}

class Sons extends Model {
  describe() {
    this.son1Binding = 'nestme';
    this.son2Binding = 'nestme2';
  }
}

const genderNameMap = {
  susan: 'leans toward female',
  alex: 'could be any',
  charlie: 'leans toward male'
}

class Parent extends Model {

  describe() {
    
    this.nameBinding = 'parent';
    this.getGender = () => genderNameMap[this.parent] || 'unknown';
    this.getUUID = () => 

    this.getGender
  }
}

class MyModel extends Model {

  describe() {

    this.__preserveCase = true;

    this.idBinding = 'foo';

    this.getUUID = () => this.bar * 2;

    this._modelSubtree = {
      me: Me
    };

    this._nested = {
      kids: { sons: Sons },
      parents: { arr: Parent }
    }

    this.getpatriarchy = () => this.arr.filter( ({parent}) => genderNameMap[parent] === 'leans toward male' );
  }
}

const result = serialize( oldData, MyModel );

console.log( JSON.stringify(result) );

Promise.resolve( oldData )
          .then( serialize( MyModel ) )
          .then( ({ parents: [ favorite ]}) => console.log( "favorite parent: ", favorite ) );
          