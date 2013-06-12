var mongoose = require("mongoose"),
	Schema = mongoose.Schema;

var Brand = new Schema({
	name: String
});

exports = module.exports = mongoose.model('Brand', Brand);
