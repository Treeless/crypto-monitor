(function() {
  // Setup chai
  var chai = require('chai');
  global.expect = chai.expect;
  chai.should();
  chai.use(require('sinon-chai'));
  chai.use(require('chai-http'));

  // Setup sinon
  global.sinon = require('sinon');
}());