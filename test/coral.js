/**
 * Test dependencies.
 */
var should = require('should'),
  express = require('express'),
  Coral = require('../lib/coral');

describe('coral', function() {

  var app, coral;

  beforeEach(function() {
    app = express();
    coral = new Coral(app);
  });

  it('route - must create proper routes', function() {

    coral.route({
      path: '/user',
      model: 'User'
    });

    var get = app.routes.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('/user');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('/user/:idAttribute');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('/user');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('/user/:idAttribute');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    del.should.have.length(1);
    del[0].path.should.equal('/user/:idAttribute');
    del[0].method.should.equal('delete');

  });

  it('route with methods get, post, put - should create specific routes', function() {

    coral.route({
      path: '/article',
      model: 'Article',
      methods: ['get', 'post', 'put']
    });

    var get = app.routes.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('/article');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('/article/:idAttribute');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('/article');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('/article/:idAttribute');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    should.not.exist(del);

  });

  it('route with methods del - should create specific routes', function() {

    coral.route({
      path: '/admin/user',
      model: 'User',
      methods: ['del']
    });

    var get = app.routes.get;
    should.not.exist(get);

    var post = app.routes.post;
    should.not.exist(post);

    var put = app.routes.put;
    should.not.exist(put);

    var del = app.routes.delete;
    del.should.have.length(1);
    del[0].path.should.equal('/admin/user/:idAttribute');
    del[0].method.should.equal('delete');

  });

  it('version - must match proper format', function() {
    Coral.version.should.match(/[0-9]+\.[0-9]+\.[0-9]+/);
  });

  it('version - must match version number', function() {
    Coral.version.should.equal('0.2.2');
  });

});