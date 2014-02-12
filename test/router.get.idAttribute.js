/**
 * Test dependencies.
 */
var Router = require('../lib/router'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express();

describe('route get with idAttribute tests', function() {
  var router;

  before(function(done) {
    db.connect();
    router = new Router(app);
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('get with idAttribute - must create proper get route and return exact record', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name'
    };

    //call router get with the config
    router.get(config);

    //invoke path with supertest
    request(app)
      .get(config.path + '/abc')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.equal('abc');
        done(err); //pass err so that fail expect errors will get caught
      });

  });

  it('get with idAttribute - must create proper get route and return exact record with options', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name'
    };

    //call router get with the config
    router.get(config);

    //invoke path with supertest
    request(app)
      .get(config.path + '/abc')
      .set('accept', 'application/json')
      .query({
        select: 'name'
      })
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.equal('abc');
        should.not.exists(res.body.age);
        done(err); //pass err so that fail expect errors will get caught
      });

  });

});