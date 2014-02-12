/**
 * Test dependencies.
 */
var Router = require('../lib/router'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express();

describe('route del tests', function() {
  var router;

  //require to get req body parameters
  app.use(express.bodyParser());

  before(function(done) {
    db.connect();
    router = new Router(app);
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('del - must create proper del route and remove matching record', function(done) {
    //config for route
    var config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name'
    };

    //call router put with the config
    router.del(config);

    //invoke path with supertest
    request(app)
      .del(config.path + '/abc')
      .set('accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        done(err); //pass err so that fail expect errors will get caught
      });

  });


});