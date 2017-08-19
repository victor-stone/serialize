
/*
  See ./serialize
*/

class Model {

  constructor(jsonData, bindParent,ctx) {
    Object.assign(this,jsonData);
    this._bindParent = bindParent;
    this._ctx = ctx;
  }

}

module.exports = Model;

