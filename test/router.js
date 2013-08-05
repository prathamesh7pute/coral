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
    router.find('/', data.brand, options);
    request(app)
      .get('/')
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
        res.body.length.should.equal(3);
        res.body[0].name.should.equal('C');
        res.body[1].name.should.equal('B');
        res.body[2].name.should.equal('A');
        done();
      });
  });

  it('findOne - must create proper get route when id pass', function(done) {
    var data = db.getData();
    router.findOne('/localhost', data.brand, '_id');
    request(app)
      .get('/localhost/' + data.brandData[0])
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('A');
        done();
      });
  });

  it('findOne - must create proper get route when name pass', function(done) {
    var data = db.getData();
    router.findOne('/localhost/name', data.brand, 'name');
    request(app)
      .get('/localhost/name/A')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('A');
        done();
      });
  });

  it('create - must create proper post route', function(done) {
    var record = {
      'name': 'Samsung'
    };
    var data = db.getData();
    router.create('/localhost', data.brand);
    request(app)
      .post('/localhost')
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Samsung');
        done();
      });
  });

  it('update - must create proper put route', function(done) {
    var record = {
      'name': 'Samsung'
    };
    var data = db.getData();
    router.update('/localhost', data.brand, '_id');
    request(app)
      .put('/localhost/' + data.brandData[0])
      .send(record)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.name.should.equal('Samsung');
        done();
      });
  });

  it('remove - must create proper delete route', function(done) {
    var data = db.getData();
    router.remove('/localhost', data.brand, '_id');
    request(app)
      .del('/localhost/' + data.brandData[0])
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