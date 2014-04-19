/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  should = require('should'),
  request = require('supertest'),
  express = require('express');

xdescribe('coral', function() {
  var app;

  beforeEach(function(done) {
    app = express();
    done();
  });

  it('route - must create proper routes', function(done) {

    var config = {
      path: 'localhost/user',
      model: 'User'
    };

    app.use(new Coral(config));

    request(app)
      .get(config.path)
      .expect(200, done);

  });

  /* it('route with methods get, post, put - should create specific routes', function() {

    var config = {
      path: 'localhost/article',
      model: 'Article',
      methods: ['get', 'post', 'put']
    };

    var get = app.routes.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('localhost/article');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('localhost/article/:idAttribute');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('localhost/article');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('localhost/article/:idAttribute');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    should.not.exist(del);

  });

  it('route with methods del - should create specific del routes', function() {

    var config = {
      path: 'localhost/admin/user',
      model: 'User',
      methods: ['del']
    };

    var get = app.routes.get;
    should.not.exist(get);

    var post = app.routes.post;
    should.not.exist(post);

    var put = app.routes.put;
    should.not.exist(put);

    var del = app.routes.delete;
    del.should.have.length(1);
    del[0].path.should.equal('localhost/admin/user/:idAttribute');
    del[0].method.should.equal('delete');

  }); */

});