/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query create tests', function() {
  var query;

  before(function(done) {
    db.connect();
    query = new Query(db.getModel('User'));
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('create - must create proper records if pass array of records', function(done) {
    //data to insert
    var records = [{
      name: 'Ryan',
      age: 27
    }, {
      name: 'Scott',
      age: 18
    }];

    //invoke query create method
    query.create(records, function(err, record1, record2) {
      record1.name.should.equal('Ryan');
      record1.age.should.equal(27);
      record2.name.should.equal('Scott');
      record2.age.should.equal(18);
      done();
    });

  });

  it('create - must create proper records if pass object', function(done) {
    //data to insert
    var data = {
      name: 'Ryan',
      age: 27
    };

    //invoke query create method
    query.create(data, function(err, record) {
      record.name.should.equal('Ryan');
      record.age.should.equal(27);
      done();
    });

  });

  it('create - records should not exists if pass blank array', function(done) {
    //data to insert
    var data = [];

    //invoke query create method
    query.create(data, function(err, records) {
      should.not.exist(records);
      done();
    });

  });

  it('create - must create blank record if pass blank object', function(done) {
    //data to insert
    var data = {};

    //invoke query create method
    query.create(data, function(err, record) {
      should.not.exist(record.name);
      should.not.exist(record.age);
      done();
    });

  });

  it('create - must throw error with improper email address', function(done) {
    //data to insert
    var records = {
      name: 'xyz',
      age: 27,
      email: 'xyz.com' // pass invalid email address (no @)
    };

    //invoke query create method
    query.create(records, function(err, record1) {
      err.errors.email.message.should.equal('Invalid email address');
      done();
    });

  });

});