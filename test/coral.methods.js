/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest');

describe('Coral methods tests', function() {

  before(function(done) {
    db.connect();
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  describe('no methods - must create all required routes', function(done) {

    var config, app;

    before(function() {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User')
      };
      app = express();
      app.use(new Coral(config));
    });

    //without idAttributes
    it('get - must create proper get route', function(done) {
      request(app)
        .get(config.path)
        .expect(200, done);
    });

    it('post - must create proper post route', function(done) {
      request(app)
        .post(config.path)
        .expect(200, done);
    });

    it('put - must create proper put route', function(done) {
      request(app)
        .put(config.path)
        .expect(404, done);
    });

    it('del - must create proper del route', function(done) {
      request(app)
        .del(config.path)
        .expect(404, done);
    });

    //with idAttributes
    it('get - must create proper get route with idAttribute', function(done) {
      request(app)
        .get(config.path + '/abc')
        .expect(200, done);
    });

    it('post - must create proper post route with idAttribute', function(done) {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done);
    });

    it('put - must create proper put route with idAttribute', function(done) {
      request(app)
        .put(config.path + '/abc')
        .expect(200, done);
    });

    it('del - must create proper del route with idAttribute', function(done) {
      request(app)
        .del(config.path + '/abc')
        .expect(200, done);
    });


  });

  describe('get, put - must create only get, put route', function(done) {

    var config, app;

    before(function() {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['GET', 'PUT']
      };
      app = express();
      app.use(new Coral(config));
    });

    //without idAttributes
    it('get - must create proper get route', function(done) {
      request(app)
        .get(config.path)
        .expect(200, done);
    });

    it('post - must create proper post route', function(done) {
      request(app)
        .post(config.path)
        .expect(404, done);
    });

    it('put - must create proper put route', function(done) {
      request(app)
        .put(config.path)
        .expect(404, done);
    });

    it('del - must create proper del route', function(done) {
      request(app)
        .del(config.path)
        .expect(404, done);
    });

    //with idAttributes
    it('get - must create proper get route with idAttribute', function(done) {
      request(app)
        .get(config.path + '/abc')
        .expect(200, done);
    });

    it('post - must create proper post route with idAttribute', function(done) {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done);
    });

    it('put - must create proper put route with idAttribute', function(done) {
      request(app)
        .put(config.path + '/abc')
        .expect(200, done);
    });

    it('del - must create proper del route with idAttribute', function(done) {
      request(app)
        .del(config.path + '/abc')
        .expect(404, done);
    });


  });

  describe('post, delete - must create only post, delete route', function(done) {

    var config, app;

    before(function() {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['POST', 'DELETE']
      };
      app = express();
      app.use(new Coral(config));
    });

    //without idAttributes
    it('get - must create proper get route', function(done) {
      request(app)
        .get(config.path)
        .expect(404, done);
    });

    it('post - must create proper post route', function(done) {
      request(app)
        .post(config.path)
        .expect(200, done);
    });

    it('put - must create proper put route', function(done) {
      request(app)
        .put(config.path)
        .expect(404, done);
    });

    it('del - must create proper del route', function(done) {
      request(app)
        .del(config.path)
        .expect(404, done);
    });

    //with idAttributes
    it('get - must create proper get route with idAttribute', function(done) {
      request(app)
        .get(config.path + '/abc')
        .expect(404, done);
    });

    it('post - must create proper post route with idAttribute', function(done) {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done);
    });

    it('put - must create proper put route with idAttribute', function(done) {
      request(app)
        .put(config.path + '/abc')
        .expect(404, done);
    });

    it('del - must create proper del route with idAttribute', function(done) {
      request(app)
        .del(config.path + '/abc')
        .expect(200, done);
    });


  });

});