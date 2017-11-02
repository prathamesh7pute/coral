/*
 * DB exports following functions
 * connect
 * disconnect
 * insertRecords
 * removeRecords
 * initialise with sample data
 */

var mongoose = require('mongoose')
var _ = require('underscore')
var async = require('async')
var testData = require('./data')

mongoose.Promise = global.Promise

module.exports = new DB()

function DB () {
  var connection, models

  var connect = function () {
    connection = mongoose.createConnection(process.env.MONGO_URL || 'mongodb://localhost/coral_test', {})
    // initialise models
    models = require('./models')(mongoose, connection)
  }

  var disconnect = function (done) {
    connection.close(done)
  }

  var getModel = function (modelName) {
    return models[modelName]
  }

  var insertRecords = function (callback) {
    var insertUsers = function (done) {
      getModel('User').create(testData.users, function (err, users) {
        done(err, users)
      })
    }

    var insertArticles = function (users, done) {
      var articles = testData.articles

      // article one
      articles[0].author = users[0]
      articles[0].likes = [users[1], users[2]]
      // comment first
      articles[0].comments[0].user = users[1]
      articles[0].comments[0].likes = [users[0], users[2]]
      articles[0].comments[0].replies[0].user = users[2]
      articles[0].comments[0].replies[0].likes = [users[0], users[1]]
      // comment second
      articles[0].comments[1].user = users[0]
      articles[0].comments[1].likes = [users[1], users[2]]
      articles[0].comments[1].replies[0].user = users[1]
      articles[0].comments[1].replies[0].likes = [users[2], users[1]]
      articles[0].comments[1].replies[1].user = users[0]
      articles[0].comments[1].replies[1].likes = [users[0], users[2]]

      // article two
      articles[1].author = users[1]
      articles[1].likes = [users[1], users[2]]
      articles[1].comments[0].user = users[2]
      articles[1].comments[0].likes = [users[0], users[2]]
      articles[1].comments[0].replies[0].user = users[0]
      articles[1].comments[0].replies[0] = [users[0], users[1]]

      getModel('Article').create(articles, function (err, article) {
        if (!err) {
          users[0].articles.push(article[0])
          users[0].save(done)
        }
      })
    }

    async.waterfall([
      insertUsers,
      insertArticles
    ], callback)
  }

  var removeRecords = function (callback) {
    // iterator to remove docs for each model
    var iterator = function (modelName, cb) {
      getModel(modelName).remove(cb)
    }

    // onsert all records for model one by one
    async.each(_.keys(models), iterator, callback)
  }

  var initialise = function (done) {
    async.series([
      removeRecords,
      insertRecords
    ], done)
  }

  return {
    connect: connect,
    disconnect: disconnect,
    getModel: getModel,
    insertRecords: insertRecords,
    removeRecords: removeRecords,
    initialise: initialise
  }
}
