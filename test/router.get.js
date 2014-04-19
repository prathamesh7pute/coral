/**
 * Test dependencies.
 */
var Router = require('../lib/router'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express();

xdescribe('route get tests', function() {
  var router;

  before(function(done) {
    db.connect();
    router = new Router(app);
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('get - must create proper get route return all records if no queries provided', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/user',
      model: db.getModel('User')
    };

    //call router get with the config
    router.get(config);

    //invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.length.should.equal(3);
        done(err); //pass err so that fail expect errors will get caught
      });

  });

  it('get - must create proper get route return sorted records if sort query provided', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/user',
      model: db.getModel('User')
    };

    //call router get with the config
    router.get(config);

    //invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .query({
        sort: 'name',
        order: 'desc'
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