/**
 * Test dependencies.
 */
describe('coral', function() {

    var should = require('should'),
        express = require('express'),
        supertest = require('supertest'),
        Brand = require('./models/brand'),
        Coral = require('../lib/coral'),
        app = express();

    it('create - must create proper routes', function() {
        var coral = new Coral(app),
            conf = {
                path: '/brand',
                methods: ['get', 'post', 'put', 'delete'],
                params: ['bid'],
                models: [Brand],
                findAll: true
            };

        coral.create(conf);

        var get = app.routes.get;
        get.should.have.length(2);
        get[0].path.should.equal('/brand');
        get[0].method.should.equal('get');
        get[1].path.should.equal('/brand/:bid');
        get[1].method.should.equal('get');

        var post = app.routes.post;
        post.should.have.length(1);
        post[0].path.should.equal('/brand');
        post[0].method.should.equal('post');

        var put = app.routes.put;
        put.should.have.length(1);
        put[0].path.should.equal('/brand/:bid');
        put[0].method.should.equal('put');

        var del = app.routes.delete;
        del.should.have.length(1);
        del[0].path.should.equal('/brand/:bid');
        del[0].method.should.equal('delete');

    });

    it('version - must match proper format', function() {
        Coral.version.should.match(/[0-9]+\.[0-9]+\.[0-9]+/);
    });

    it('version - must match version number', function() {
        Coral.version.should.equal("0.1.0");
    });

});
