var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	config = require('../../config'),
	async = require('async');

//Brand Schema
var BrandSchema = new Schema({
	name: String
});

//Product Schema 
var ProductSchema = new Schema({
	name: String
});

var db = function() {

	var conn, data;

	var connect = function() {
		conn = mongoose.createConnection(config.dbUrl, {});
	};

	var initialize = function(done) {
		var Brand = conn.model('brand', BrandSchema);
		var Product = conn.model('product', ProductSchema);

		async.series({
				clearBrand: function(callback) {
					clear(Brand, callback);
				},
				clearProduct: function(callback) {
					clear(Product, callback);
				},
				insertBrandOne: function(callback) {
					save(Brand, 'A', callback);
				},
				insertBrandTwo: function(callback) {
					save(Brand, 'B', callback);
				},
				insertBrandThree: function(callback) {
					save(Brand, 'C', callback);
				},
				insertProductOne: function(callback) {
					save(Product, 'p1', callback);
				},
				insertProductTwo: function(callback) {
					save(Product, 'p2', callback);
				},
				insertProductThree: function(callback) {
					save(Product, 'p3', callback);
				}
			},
			function(err, results) {
				data = {
					brand: Brand,
					product: Product,
					brandData: [results.insertBrandOne, results.insertBrandTwo, results.insertBrandThree],
					productData: [results.insertProductOne, results.insertProductTwo, results.insertProductThree]
				};
				done();
			});
	};

	var getData = function() {
		return data;
	};

	var clear = function(Model, callback) {
		Model.remove({}, function(err) {
			if (err) {
				callback(err, 1);
			}
			callback(null, 0);
		});
	};

	var save = function(Model, data, callback) {
		var model = new Model();
		model.name = data;
		model.save(function(err, doc) {
			if (err) {
				callback(err, 1);
			} else {
				callback(null, doc._id);
			}
		});
	};

	var disconnect = function(done) {
		conn.close(done);
	};

	return {
		connect: connect,
		initialize: initialize,
		disconnect: disconnect,
		getData: getData
	};
};

module.exports = db;

module.exports.mongoose = mongoose;