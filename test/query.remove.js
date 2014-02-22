/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query findOneAndRemove tests', function() {
  var query;

  before(function(done) {
    db.connect();
    query = new Query(db.getModel('User'));
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('findOneAndRemove - must remove proper record', function(done) {
    //identifier to remove the specific record
    var config = {
      conditions: {
        name: 'abc'
      }
    };

    //invoke findOne and remove 
    query.findOneAndRemove(config, function(err) {
      should.not.exist(err);
      if (!err) {
        done();
      }
    });

  });

});