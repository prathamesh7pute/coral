/**
 * Test dependencies.
 */

var Router = require('../lib/router'),
  DB = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express(),
  router = new Router(app);


describe('router', function() {

  var db = new DB();

  app.use(express.bodyParser());

  beforeEach(function(done) {
    db.connect();
    db.initialize(done);
  });

  afterEach(function(done) {
    db.disconnect(done);
  });


  it('find with sorting - must create proper get route', function(done) {
    var options = {};
    var data = db.getData();
    router.find('/localhost', data.model, options);
    request(app)
      .get('/localhost')
      .set('accept', 'application/json')
      .query({
        sort: 'name',
        order: 'desc'
      })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.length.should.equal(2);
        res.body[0].name.should.equal('xyz');
        res.body[1].name.should.equal('abc');
        done();
      });
  });

  it('findOne - must create proper get route when id pass', function(done) {
    var data = db.getData();
    router.findOne('/localhost', data.model, '_id');
    request(app)
      .get('/localhost/' + data.userid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('abc');
        done();
      });
  });

  it('findOne - must create proper get route when name pass', function(done) {
    var data = db.getData();
    router.findOne('/localhost/name', data.model, 'name');
    request(app)
      .get('/localhost/name/abc')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('abc');
        done();
      });
  });

  it('create - must create proper post route', function(done) {
    var record = {
      name: 'Ryan',
      age: 26
    };
    var data = db.getData();
    router.create('/localhost', data.model);
    request(app)
      .post('/localhost')
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Ryan');
        res.body.age.should.equal(26);
        done();
      });
  });

  it('update - must create proper put route', function(done) {
    var record = {
      'name': 'Scott'
    };
    var data = db.getData();
    router.update('/localhost', data.model, '_id');
    request(app)
      .put('/localhost/' + data.userid)
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Scott');
        done();
      });
  });

  it('remove - must create proper delete route', function(done) {
    var data = db.getData();
    router.remove('/localhost', data.model, '_id');
    request(app)
      .del('/localhost/' + data.userid)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.should.have.status(200);
        done();
      });
  });

});