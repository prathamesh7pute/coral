/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express();

describe('Coral get with idAttribute tests', function() {

  before(function(done) {
    db.connect();
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
    app.use(new Coral(config));

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
    app.use(new Coral(config));

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