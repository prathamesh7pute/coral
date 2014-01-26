/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query findOneAndUpdate tests', function() {
  var query;

  before(function(done) {
    db.connect();
    query = new Query(db.getModel('User'));
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('findOneAndUpdate - must update proper record', function(done) {
    //update data
    var data = {
      name: 'Ryan'
    };

    //identifier to update the specific record
    var identifier = {
      name: 'abc'
    };

    //invoke findOne and update 
    query.findOneAndUpdate(identifier, data, function(err, record) {
      //name should get modify from abc to Ryan
      record.name.should.equal('Ryan');
      //age should not chage
      record.age.should.equal(10);
      done();
    });

  });

});