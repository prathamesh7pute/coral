var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	age: Number,
	articles: [{
		type: Schema.Types.ObjectId,
		ref: 'Article'
	}]
});

exports = module.exports = mongoose.model('User', UserSchema);