/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query find tests', function() {
  var query;

  before(function(done) {
    db.connect();
    query = new Query(db.getModel('User'));
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('find - must return all available records', function(done) {
    //query options
    var options = {
      findAll: true
    };

    query.find(options, function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('abc');
      records[1].name.should.equal('def');
      records[2].name.should.equal('xyz');
      done();
    });

  });

  it('find - must return all available records with sort and in descending order', function(done) {
    //query options
    var options = {
      sort: '-name',
      skip: '0',
      limit: '3'
    };

    query.find(options, function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('xyz');
      records[1].name.should.equal('def');
      records[2].name.should.equal('abc');
      done();
    });

  });

  it('find - must return all available records with sort, in ascending order and limit of 2', function(done) {
    //query options
    var options = {
      sort: 'name',
      skip: '0',
      limit: '2'
    };

    query.find(options, function(err, records) {
      records.length.should.equal(2);
      records[0].name.should.equal('abc');
      records[1].name.should.equal('def');
      done();
    });

  });

  it('find - must return all records with asc sort order with skip first record and limit of 2', function(done) {
    //query options
    var options = {
      sort: 'name',
      skip: '2',
      limit: '1'
    };

    query.find(options, function(err, records) {
      records.length.should.equal(1);
      records[0].name.should.equal('xyz');
      done();
    });

  });

  it('find - must return all available records with select of age only', function(done) {
    //query options
    var options = {
      select: '-name -_id -articles',
      findAll: true
    };

    query.find(options, function(err, records) {
      records.length.should.equal(3);
      should.exist(records[0].age);
      should.exist(records[1].age);
      should.not.exist(records[0].names);
      should.not.exist(records[1].names);
      done();
    });

  });

  it('find - must return empty records without any options like pagination, skip and findAll', function(done) {
    //query options
    var options = {};

    query.find(options, function(err, records) {
      should.not.exist(records);
      done();
    });

  });

  it('find - must return zero records for empty collection', function(done) {
    //find options on the query
    var options = {
      findAll: true
    };

    //remove all the records first
    db.removeRecords(function(err, records) {
      //once removed all records call the find query now
      query.find(options, function(err, records) {
        records.length.should.equal(0);
        done();
      });
    });

  });

});