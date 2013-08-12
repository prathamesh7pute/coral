var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ReplySchema = new Schema({
  body: String,
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

exports = module.exports = mongoose.model('Reply', ReplySchema);