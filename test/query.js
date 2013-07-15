/**
 * Test dependencies.
 */

var Query = require('../lib/query'),
  connection = require('./common'),
  mongoose = connection.mongoose,
  Schema = mongoose.Schema,
  should = require('should');

/**
 * Setup
 */
var schema = new Schema({
  name: String
});


describe('query', function() {

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


  it('findById - must return exact available record', function(done) {
    var cb = function(err, record) {
      if (!err) {
        record.name.should.equal('Apple');
      } else {
        console.log(err);
      }
      done();
    };
    var query = new Query(Brand);
    query.findById(id, cb);
  });

  it('findAll - must return all available records', function(done) {
    var cb = function(err, records) {
      if (!err) {
        records.length.should.equal(1);
        records[0].name.should.equal('Apple');
      } else {
        console.log(err);
      }
      done();
    };
    var query = new Query(Brand);
    query.findAll({}, cb);
  });

  it('create - must create proper records', function(done) {
    var query = new Query(Brand),
      data = [{
        name: 'samsung'
      }, {
        name: 'nokia'
      }],
      cb = function(err, record1, record2) {
        if (!err) {
          record1.name.should.equal('samsung');
          record2.name.should.equal('nokia');
        } else {
          console.log(err);
        }
        done();
      };
    query.create(data, cb);
  });

  it('findByIdAndUpdate - must update proper record', function(done) {
    var query = new Query(Brand),
      data = {
        name: 'samsung'
      },
      cb = function(err, record) {
        if (!err) {
          record.name.should.equal('samsung');
        } else {
          console.log(err);
        }
        done();
      };
    query.findByIdAndUpdate(id, data, cb);
  });

  it('findByIdAndRemove - must remove proper record', function(done) {
    var query = new Query(Brand),
      cb = function(err) {
        should.not.exist(err);
        if (!err) {
          done();
        }
      };
    query.findByIdAndRemove(id, cb);
  });

});