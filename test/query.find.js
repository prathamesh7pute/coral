/**
 * Test dependencies.
 */

var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

//sample data
var userData = [{
  name: 'abc',
  age: 10
}, {
  name: 'def',
  age: 20
}, {
  name: 'xyz',
  age: 30
}];

describe('query find tests', function() {
  var query;

  beforeEach(function(done) {
    var User;
    db.connect();
    User = db.getModel('User');
    query = new Query(User);
    db.removeRecords(function() {
      db.insertRecords(User, userData, done);
    });
  });

  afterEach(function(done) {
    db.disconnect(done);
  });

  it('find - must return zero records for empty collection', function(done) {
    //find options on the query
    var options = {
      findAll: true
    };

    var findCallback = function(err, records) {
      records.length.should.equal(0);
      done();
    };

    var removeCallback = function(err, records) {
      //call the find query now
      //find call with findAll options
      query.find(options, findCallback);
    };

    //remove all the records first
    db.removeRecords(removeCallback);
  });

  it('find - must return all available records', function(done) {
    var callback = function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('abc');
      records[1].name.should.equal('def');
      records[2].name.should.equal('xyz');
      done();
    };
    var options = {
      findAll: true
    };
    query.find(options, callback);
  });

  it('find - must return all available records with sort and in descending order', function(done) {
    var callback = function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('xyz');
      records[1].name.should.equal('def');
      records[2].name.should.equal('abc');
      done();
    };
    var options = {
      sort: '-name',
      skip: '0',
      limit: '3'
    };
    query.find(options, callback);
  });

  it('find - must return all available records with sort, in ascending order and limit of 2', function(done) {
    var callback = function(err, records) {
      records.length.should.equal(2);
      records[0].name.should.equal('abc');
      records[1].name.should.equal('def');
      done();
    };
    var options = {
      sort: 'name',
      skip: '0',
      limit: '2'
    };
    query.find(options, callback);
  });

  it('find - must return all records with asc sort order with skip first record and limit of 2', function(done) {
    var callback = function(err, records) {
      records.length.should.equal(1);
      records[0].name.should.equal('xyz');
      done();
    };
    var options = {
      sort: 'name',
      skip: '2',
      limit: '1'
    };
    query.find(options, callback);
  });

  it('find - must return all available records with select of age only', function(done) {
    var callback = function(err, records) {
      records.length.should.equal(3);
      should.exist(records[0].age);
      should.exist(records[1].age);
      should.not.exist(records[0].names);
      should.not.exist(records[1].names);
      done();
    };
    var options = {
      select: '-name -_id -articles',
      findAll: true
    };
    query.find(options, callback);
  });

  it('find - must return empty records without pagination, skip and findAll', function(done) {
    var callback = function(err, records) {
      should.not.exist(records);
      done();
    };
    var options = {};
    query.find(options, callback);
  });

});