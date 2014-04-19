/**
 * Test dependencies.
 */
var Router = require('../lib/router'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  bodyParser = require('body-parser'),
  app = express();

xdescribe('route post tests', function() {
  var router;

  //require to get req body parameters
  app.use(bodyParser());

  before(function(done) {
    db.connect();
    router = new Router(app);
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('post - must create proper post route and return matching record', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/user',
      model: db.getModel('User')
    };

    //data to be pass into post request
    var data = {
      name: 'test',
      age: 40
    };

    //call router get with the config
    router.post(config);

    //invoke path with supertest
    request(app)
      .post(config.path)
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.equal('test');
        res.body.age.should.equal(40);
        done(err); //pass err so that fail expect errors will get caught
      });

  });


});