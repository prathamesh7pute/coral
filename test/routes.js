/**
 * Tests.
 */
describe('routes', function() {

    var should = require('should'),
        mongoose = require('mongoose'),
        Routes = require('../lib/routes'),
        express = require('express'),
        supertest = require('supertest'),
        Schema = mongoose.Schema,
        Brand = require('./models/brand'),
        app = express(),
        routes = new Routes(app),
        id;

    app.use(express.bodyParser());

    var resetData = function(done) {
        Brand.remove({}, function(err) {
            if (err) {
                console.log(err);
            }
            var brand = new Brand();
            brand.name = 'Apple';
            brand.save(function(err, doc) {
                if (err) {
                    console.log(err);
                    done();
                } else {
                    id = doc._id;
                    done();
                }

            });
        });
    };

    beforeEach(function(done) {
        mongoose.connect('mongodb://localhost/backbone_mongoose_test');
        resetData(done);
    });

    afterEach(function(done) {
        mongoose.disconnect(done);
    });

    it('find - must create proper get route', function(done) {
        routes.findAll('/', [Brand]);
        supertest(app)
            .get('/')
            .set('accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.length.should.equal(1);
                res.body[0].name.should.equal('Apple');
                done();
            });
    });

    it('findById - must create proper get route', function(done) {
        routes.findById('/:pid', ['pid'], [Brand]);
        supertest(app)
            .get('/' + id)
            .set('accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.name.should.equal('Apple');
                done();
            });
    });

    it('create - must create proper post route', function(done) {
        var data = {
            'name': 'Samsung'
        };
        routes.create('/', [Brand]);
        supertest(app)
            .post('/')
            .send(data)
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
        var data = {
            'name': 'Samsung'
        };
        routes.update('/:pid', ['pid'], [Brand]);
        supertest(app)
            .put('/' + id)
            .send(data)
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
        routes.remove('/:pid', ['pid'], [Brand]);
        supertest(app)
            .del('/' + id)
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
