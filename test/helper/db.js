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

var CommentSchema = new Schema({
  body: String,
  replies: [ReplySchema],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  comments: [CommentSchema],
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


var db = function() {

  var conn, data;

  var connect = function() {
    conn = mongoose.createConnection(config.dbUrl, {});
  };

  var initialize = function(done) {
    var User = conn.model('User', UserSchema);
    var Comment = conn.model('Comment', CommentSchema);
    var Article = conn.model('Article', ArticleSchema);
    var Reply = conn.model('Reply', ReplySchema);

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
        },
        createArticleOne: function(callback) {
          save(Article, {
            title: 'Coral Framework',
            body: 'Node JS framework to dynamically create REST application with express and mongoose Models',
            comments: [{
              body: 'How to create nested sub-docs on route ?',
              replies: [{
                body: 'you can add sub-doc inside sub-doc in config'
              }]
            }]
          }, callback);
        }
      },
      function(err, results) {
        data = {
          userModel: User,
          articleModel: Article,
          userid: results.createUserOne._id,
          articleid: results.createArticleOne._id,
          commentid: results.createArticleOne.subDocid,
          replyid: results.createArticleOne.subSubDocid
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
        var data = {
          _id: doc._id,
          subDocid: doc.comments && doc.comments[0]._id,
          subSubDocid: doc.comments && doc.comments[0].replies && doc.comments[0].replies[0]._id
        };
        callback(null, data);
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