/**
 * Test dependencies.
 */

var Routes = require('../lib/routes'),
  connection = require('./common'),
  mongoose = connection.mongoose,
  Schema = mongoose.Schema,
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  app = express(),
  routes = new Routes(app);

/**
 * Setup
 */
var schema = new Schema({
  name: String
});

describe('routes', function() {

  app.use(express.bodyParser());

  var db, id, Brand;

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

  before(function(done) {
    db = connection();
    Brand = db.model('brand', schema);
    resetData(done);
  });

  after(function(done) {
    db.close(done);
  });

  it('find - must create proper get route', function(done) {
    var options = {
      findAll: true
    };
    routes.find('/', Brand, options);
    request(app)
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
    routes.findById('/:bid', Brand);
    request(app)
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
    routes.create('/', Brand);
    request(app)
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
    routes.update('/:bid', Brand);
    request(app)
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
    routes.remove('/:bid', Brand);
    request(app)
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