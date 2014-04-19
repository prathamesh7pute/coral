/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest');

describe('Coral query tests', function() {
  var app;

  beforeEach(function(done) {
    db.connect();
    app = express();
    db.initialise(done);
  });

  afterEach(function(done) {
    db.disconnect(done);
  });

  it('coral query - must create proper routes and return results according to query provided', function(done) {
    //config to pass 
    var config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        conditions: {
          age: {
            $lte: 20
          },
          name: {
            $in: ['abc', 'xyz']
          }
        },
        fields: 'name age -_id',
        options: {
          skip: 0,
          limit: 10,
          sort: 'name'
        }
      }
    };

    //call coral router with the config
    app.use(new Coral(config));

    //invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        var records = res.body;
        records.length.should.equal(1);
        should.exist(records[0].name);
        should.exist(records[0].age);
        should.not.exist(records[0]._id);
        done(err); //pass err so that fail expect errors will get caught
      });

  });

  it('coral query - must return sorted records with overrrided parameters from routes', function(done) {
    //config to pass 
    var config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        options: {
          sort: '-name'
        }
      }
    };

    //call coral router with the config
    app.use(new Coral(config));

    //invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .query({
        sort: 'name'
      })
      .expect(200)
      .end(function(err, res) {
        res.body.length.should.equal(3);
        res.body[0].name.should.equal('xyz');
        res.body[1].name.should.equal('def');
        res.body[2].name.should.equal('abc');
        done(err); //pass err so that fail expect errors will get caught
      });

  });

});