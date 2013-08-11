var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  config = require('../../config'),
  async = require('async');


var UserSchema = new Schema({
  name: String,
  age: Number,
  articles: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }]
});

var CommentSchema = new Schema({
  body: String,
  date: {
    type: Date,
    default: Date.now
  }
});

var ArticleSchema = new Schema({
  title: String,
  body: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: [CommentSchema],
  fans: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  hidden: Boolean
});



var db = function() {

  var conn, data;

  var connect = function() {
    conn = mongoose.createConnection(config.dbUrl, {});
  };

  var initialize = function(done) {
    var User = conn.model('User', UserSchema);
    var Comment = conn.model('Comment', CommentSchema);
    var Article = conn.model('Article', ArticleSchema);

    async.series({
        clearUserData: function(callback) {
          clear(User, callback);
        },
        clearCommentData: function(callback) {
          clear(Comment, callback);
        },
        clearArticleData: function(callback) {
          clear(Article, callback);
        },
        createUserOne: function(callback) {
          save(User, {
            name: 'abc',
            age: 28
          }, callback);
        },
        createUserTwo: function(callback) {
          save(User, {
            name: 'xyz',
            age: 18
          }, callback);
        }
      },
      function(err, results) {
        data = {
          model: User,
          userid: results.createUserOne
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
        callback(err, null);
      }
      callback(null, null);
    });
  };

  var save = function(Model, data, callback) {
    var model = new Model();
    Model.create(data, function(err, doc) {
      if (err) {
        callback(err, null);
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