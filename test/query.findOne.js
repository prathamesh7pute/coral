/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query findOne tests', function() {
  var query;

  before(function(done) {
    db.connect();
    query = new Query(db.getModel('User'));
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('findOne - must return exact available record when call with name identifier', function(done) {
    //unique identifier to find data
    var identifier = {
      name: 'abc'
    };

    query.findOne(identifier, function(err, record) {
      record.name.should.equal('abc');
      done();
    });
  });

  it('findOne - must return available record when call with multiple identifier', function(done) {
    //unique identifier to find data
    var identifier = {
      name: 'abc',
      age: 10
    };

    query.findOne(identifier, function(err, record) {
      record.name.should.equal('abc');
      done();
    });

  });

});