var mongoose = require('mongoose'),
	Comment = require('./comment'),
	Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: String,
	body: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	comments: [Comment.schema],
	likes: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	hidden: Boolean,
	date: {
		type: Date,
		default: Date.now
	}
});

exports = module.exports = mongoose.model('Article', ArticleSchema);