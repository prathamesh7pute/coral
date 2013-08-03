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
      path: '/brand',
      model: 'Brand'
    });

    var get = app.routes.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('/brand');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('/brand/:id');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('/brand');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('/brand/:id');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    del.should.have.length(1);
    del[0].path.should.equal('/brand/:id');
    del[0].method.should.equal('delete');

  });

  it('route with methods get, post, put - should create specific routes', function() {

    coral.route({
      path: '/product',
      model: 'Product',
      methods: ['get', 'post', 'put']
    });

    var get = app.routes.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('/product');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('/product/:id');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('/product');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('/product/:id');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    should.not.exist(del);

  });

  it('route with methods del - should create specific routes', function() {

    coral.route({
      path: '/product',
      model: 'Product',
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
    del[0].path.should.equal('/product/:id');
    del[0].method.should.equal('delete');

  });

  it('version - must match proper format', function() {
    Coral.version.should.match(/[0-9]+\.[0-9]+\.[0-9]+/);
  });

  it('version - must match version number', function() {
    Coral.version.should.equal('0.1.7');
  });

});