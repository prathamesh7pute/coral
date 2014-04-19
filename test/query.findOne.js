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
    var config = {
      conditions: {
        name: 'abc'
      }
    };

    query.findOne(config, function(err, record) {
      record.name.should.equal('abc');
      done();
    });
  });

  it('findOne - must return available record when call with multiple identifier', function(done) {
    //unique identifier to find data
    var config = {
      conditions: {
        name: 'abc',
        age: 10
      }
    };

    query.findOne(config, function(err, record) {
      record.name.should.equal('abc');
      done();
    });

  });

  it('findOne - must return exact record with only selected values when call with name identifier', function(done) {
    //unique identifier to find data
    var config = {
      conditions: {
        name: 'abc'
      },
      fields: 'name'
    };

    query.findOne(config, function(err, record) {
      record.name.should.equal('abc');
      should.not.exist(record.age);
      done();
    });
  });

  it('findOne - must return exact record with only selected values and populated articles', function(done) {
    //unique identifier to find data
    var config = {
      conditions: {
        name: 'abc'
      },
      fields: 'name articles',
      options: {
        populate: 'articles'
      }
    };

    query.findOne(config, function(err, record) {
      record.name.should.equal('abc');
      record.articles[0].title.should.equal('Article One');
      should.not.exist(record.age);
      done();
    });
  });

});