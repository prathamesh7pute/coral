/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express();

describe.only('Coral subdoc get tests', function() {

  before(function(done) {
    db.connect();
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('Coral subdoc get - must create proper get route return subDoc records', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/article',
      model: db.getModel('Article'),
      idAttribute: 'short-name',
      subDoc: {
        path: 'comments'
      }
    };

    //call router get with the config
    app.use(new Coral(config));

    //invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        res.body.length.should.equal(2);
        done(err); //pass err so that fail expect errors will get caught
      });

  });


});