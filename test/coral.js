/**
 * Test dependencies.
 */
var should = require('should'),
  express = require('express'),
  Coral = require('../lib/coral');



xdescribe('coral', function() {

  var app, coral;

  beforeEach(function() {
    app = express();
    coral = new Coral(app);
  });

  it('route - must create proper routes', function() {

    coral.route({
      path: 'localhost/user',
      model: 'User'
    });

    var get = app._router.get;
    get.should.have.length(2);

    //find
    get[0].path.should.equal('localhost/user');
    get[0].method.should.equal('get');

    //findById
    get[1].path.should.equal('localhost/user/:idAttribute');
    get[1].method.should.equal('get');

    var post = app.routes.post;
    post.should.have.length(1);
    post[0].path.should.equal('localhost/user');
    post[0].method.should.equal('post');

    var put = app.routes.put;
    put.should.have.length(1);
    put[0].path.should.equal('localhost/user/:idAttribute');
    put[0].method.should.equal('put');

    var del = app.routes.delete;
    del.should.have.length(1);
    del[0].path.should.equal('localhost/user/:idAttribute');
    del[0].method.should.equal('delete');

  });

  it('route with methods get, post, put - should create specific routes', function() {

    coral.route({
      path: 'localhost/article',
      model: 'Article',
      methods: ['get', 'post', 'put']
    });

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

    coral.route({
      path: 'localhost/admin/user',
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
    del[0].path.should.equal('localhost/admin/user/:idAttribute');
    del[0].method.should.equal('delete');

  });

});