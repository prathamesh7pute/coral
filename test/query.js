/**
 * Test dependencies.
 */

var Query = require('../lib/query'),
  DB = require('./helper/db'),
  should = require('should');

describe('query', function() {

  var db = new DB();

  beforeEach(function(done) {
    db.connect();
    db.initialize(done);
  });

  afterEach(function(done) {
    db.disconnect(done);
  });

  it('find - must return all available records', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(2);
        records[0].name.should.equal('abc');
        records[1].name.should.equal('xyz');
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {
      findAll: true
    };
    query.find(options, cb);
  });

  it('find - must return all available records with sort and in descending order', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(2);
        records[0].name.should.equal('xyz');
        records[1].name.should.equal('abc');
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {
      sort: '-name',
      skip: '0',
      limit: '3'
    };
    query.find(options, cb);
  });

  it('find - must return all available records with sort, in ascending order and limit of 2', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(2);
        records[0].name.should.equal('abc');
        records[1].name.should.equal('xyz');
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {
      sort: 'name',
      skip: '0',
      limit: '2'
    };
    query.find(options, cb);
  });

  it('find - must return all records with asc sort order with skip first record and limit of 2', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(1);
        records[0].name.should.equal('xyz');
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {
      sort: 'name',
      skip: '1',
      limit: '2'
    };
    query.find(options, cb);
  });

  it('find - must return all available records with select of age only', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(2);
        records[0].age.should.equal(28);
        records[1].age.should.equal(18);
        should.not.exist(records[0].names);
        should.not.exist(records[1].names);
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {
      select: '-name -_id -articles',
      findAll: true
    };
    query.find(options, cb);
  });

  it('find - must return empty records without pagination, skip and findAll', function(done) {
    var cb = function(err, records) {
      if (!err) {
        should.not.exist(records);
      } else {
        console.log(err);
      }
      done();
    };
    var data = db.getData();
    var query = new Query(data.userModel);
    var options = {};
    query.find(options, cb);
  });

  it('findOne - must return exact available record', function(done) {
    var data = db.getData();
    var query = new Query(data.userModel);
    var cb = function(err, record) {
      if (!err) {
        record.name.should.equal('abc');
      } else {
        console.log(err);
      }
      done();
    };
    var identifier = {
      '_id': data.userid
    };
    query.findOne(identifier, cb);
  });

  it('create - must create proper records', function(done) {
    var data = db.getData();
    var query = new Query(data.userModel);
    var records = [{
      name: 'Ryan'
    }, {
      name: 'Scott'
    }];
    var cb = function(err, record1, record2) {
      if (!err) {
        record1.name.should.equal('Ryan');
        record2.name.should.equal('Scott');
      } else {
        console.log(err);
      }
      done();
    };
    query.create(records, cb);
  });

  it('findOneAndUpdate - must update proper record', function(done) {
    var data = db.getData();
    var query = new Query(data.userModel);
    var records = {
      name: 'Ryan'
    };
    var cb = function(err, record) {
      if (!err) {
        record.name.should.equal('Ryan');
      } else {
        console.log(err);
      }
      done();
    };
    var identifier = {
      '_id': data.userid
    };
    query.findOneAndUpdate(identifier, records, cb);
  });

  it('findOneAndRemove - must remove proper record', function(done) {
    var data = db.getData();
    var query = new Query(data.userModel);
    var cb = function(err) {
      should.not.exist(err);
      if (!err) {
        done();
      }
    };
    var identifier = {
      '_id': data.userid
    };
    query.findOneAndRemove(identifier, cb);
  });

});