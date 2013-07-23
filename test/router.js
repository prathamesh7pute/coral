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

  before(function(done) {
    db.connect();
    db.initialize(done);
  });

  after(function(done) {
    db.disconnect(done);
  });


  it('find - must create proper get route', function(done) {
    var options = {
      findAll: true
    };
    var data = db.getData();
    router.find('/', data.brand, options);
    request(app)
      .get('/')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.length.should.equal(3);
        res.body[0].name.should.equal('A');
        done();
      });
  });

  it('findById - must create proper get route', function(done) {
    var data = db.getData();
    router.findById('/:bid', data.brand);
    request(app)
      .get('/' + data.brandData[0])
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
    router.create('/', data.brand);
    request(app)
      .post('/')
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
    router.update('/:bid', data.brand);
    request(app)
      .put('/' + data.brandData[0])
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
    router.remove('/:bid', data.brand);
    request(app)
      .del('/' + data.brandData[0])
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