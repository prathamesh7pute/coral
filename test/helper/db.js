/*
 * DB exports following functions
 * connect
 * disconnect
 * insertRecords
 * removeRecords
 * initialise with sample data
 */

var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async'),
  testData = require('./data');

module.exports = new DB();

function DB() {

  var connection, models;

  var connect = function() {
    connection = mongoose.createConnection(process.env.MONGO_URL || 'mongodb://localhost/coral_test', {});
    //initialise models
    models = require('./models')(mongoose, connection);
  };

  var disconnect = function(done) {
    connection.close(done);
  };

  var getModel = function(modelName) {
    return models[modelName];
  };

  var insertRecords = function(callback) {

    var insertUsers = function(done) {
      getModel('User').create(testData.users, function(err, user1, user2, user3) {
        done(err, user1, user2, user3);
      });
    };

    var insertArticles = function(user1, user2, user3, done) {
      var articles = testData.articles;

      //article one
      articles[0].author = user1;
      articles[0].likes = [user2, user3];
      //comment first
      articles[0].comments[0].user = user2;
      articles[0].comments[0].likes = [user1, user3];
      articles[0].comments[0].replies[0].user = user3;
      articles[0].comments[0].replies[0].likes = [user1, user2];
      //comment second
      articles[0].comments[1].user = user1;
      articles[0].comments[1].likes = [user2, user3];
      articles[0].comments[1].replies[0].user = user2;
      articles[0].comments[1].replies[0].likes = [user3, user2];
      articles[0].comments[1].replies[1].user = user1;
      articles[0].comments[1].replies[1].likes = [user1, user3];

      //article two 
      articles[1].author = user2;
      articles[1].likes = [user2, user3];
      articles[1].comments[0].user = user3;
      articles[1].comments[0].likes = [user1, user3];
      articles[1].comments[0].replies[0].user = user1;
      articles[1].comments[0].replies[0] = [user1, user2];

      getModel('Article').create(articles, function(err, article) {
        user1.articles.push(article);
        user1.save(done);
      });
    };

    async.waterfall([
      insertUsers,
      insertArticles
    ], callback);

  };

  var removeRecords = function(callback) {
    //iterator to remove docs for each model
    var iterator = function(modelName, cb) {
      getModel(modelName).remove(cb);
    };

    //onsert all records for model one by one
    async.each(_.keys(models), iterator, callback);
  };

  var initialise = function(done) {
    async.series([
      removeRecords,
      insertRecords
    ], done);
  };

  return {
    connect: connect,
    disconnect: disconnect,
    getModel: getModel,
    insertRecords: insertRecords,
    removeRecords: removeRecords,
    initialise: initialise
  };
}