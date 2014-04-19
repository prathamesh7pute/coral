/**
 * Test dependencies.
 */
var Query = require('../lib/query'),
  db = require('./helper/db'),
  should = require('should');

describe('query find tests', function() {
  var query;

  before(function() {
    db.connect();
    query = new Query(db.getModel('User'));
  });

  after(function(done) {
    db.disconnect(done);
  });

  beforeEach(function(done) {
    db.initialise(done);
  });

  it('find - must return all available records', function(done) {
    //query config
    var config = {};

    query.find(config, function(err, records) {
      records.length.should.equal(3);
      done();
    });

  });

  it('find - must return all available records with sort and in descending order', function(done) {
    //query config
    var config = {
      options: {
        sort: '-name',
        skip: '0',
        limit: '3'
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('xyz');
      records[1].name.should.equal('def');
      records[2].name.should.equal('abc');
      done();
    });

  });

  it('find - must return all available records with sort, in ascending order and limit of 2', function(done) {
    //query config
    var config = {
      options: {
        sort: 'name',
        skip: '0',
        limit: '2'
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(2);
      records[0].name.should.equal('abc');
      records[1].name.should.equal('def');
      done();
    });

  });

  it('find - must return all records with asc sort order with skip first record and limit of 2', function(done) {
    //query config
    var config = {
      options: {
        sort: 'name',
        skip: '2',
        limit: '1'
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(1);
      records[0].name.should.equal('xyz');
      done();
    });

  });



  it('find - must return all available records with select of age only', function(done) {
    //query config
    var config = {
      fields: '-name -_id -articles'
    };

    query.find(config, function(err, records) {
      records.length.should.equal(3);
      should.exist(records[0].age);
      should.not.exist(records[0].names);
      done();
    });

  });

  it('find - must return all records with sort, filters, skip and limit', function(done) {
    //query config
    var config = {
      options: {
        sort: 'name',
        skip: '0',
        limit: '10'
      },
      conditions: {
        age: {
          $lte: 20
        },
        name: {
          $in: ['abc', 'xyz']
        }
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(1);
      done();
    });

  });

  it('find - must return specific records available records with article populated', function(done) {
    //query config
    var config = {
      options: {
        sort: 'name',
        skip: '0',
        limit: '1',
        populate: 'articles'
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(1);
      records[0].name.should.equal('abc');
      records[0].articles[0].title.should.equal('Article One');
      done();
    });

  });


  it('find - must return all records available records with article populated', function(done) {
    //query config
    var config = {
      options: {
        sort: 'name',
        populate: 'articles'
      }
    };

    query.find(config, function(err, records) {
      records.length.should.equal(3);
      records[0].name.should.equal('abc');
      records[0].articles[0].title.should.equal('Article One');
      done();
    });

  });

  it('find - must return zero records for empty collection', function(done) {
    //find config on the query
    var config = {};

    //remove all the records first
    db.removeRecords(function(err, records) {
      //once removed all records call the find query now
      query.find(config, function(err, records) {
        records.length.should.equal(0);
        done();
      });
    });

  });

});