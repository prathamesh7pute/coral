var mongoose = require('mongoose'),
	Reply = require('./reply'),
	Schema = mongoose.Schema;

var CommentSchema = new Schema({
	body: String,
	replies: [Reply.schema],
	likes: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	date: {
		type: Date,
		default: Date.now
	}
});

exports = module.exports = mongoose.model('Comment', CommentSchema);