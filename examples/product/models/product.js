var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Product = new Schema({
  name: String
});

exports = module.exports = mongoose.model('Product', Product);