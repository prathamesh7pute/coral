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
var MongoMemoryServer
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
} catch (err) {
  MongoMemoryServer = null
}

mongoose.Promise = global.Promise

module.exports = new DB()

function DB () {
  var connection, models, mongoServer, readyPromise

  var connect = function (done) {
    if (readyPromise) {
      if (done) {
        readyPromise.then(function () { done() }).catch(done)
      }
      return
    }

    if (!connection) {
      connection = mongoose.createConnection()
      models = require('./models')(mongoose, connection)
    }

    readyPromise = (async function () {
      var uri = process.env.MONGO_URL
      if (!uri) {
        if (!MongoMemoryServer) {
          throw new Error('No MongoDB connection available. Set MONGO_URL or install mongodb-memory-server.')
        }
        mongoServer = await MongoMemoryServer.create({
          instance: { ip: '127.0.0.1' }
        })
        uri = mongoServer.getUri()
      }
      await connection.openUri(uri, {})
      // ensure indexes/collections are ready before tests run
      await connection.asPromise()
    })()

    if (done) {
      readyPromise.then(function () { done() }).catch(done)
    }
  }

  var disconnect = function (done) {
    var finish = function () {
      if (mongoServer) {
        mongoServer.stop()
          .then(function () {
            mongoServer = null
            readyPromise = null
            connection = null
            models = null
            done()
          })
          .catch(done)
      } else {
        readyPromise = null
        connection = null
        models = null
        done()
      }
    }

    if (connection) {
      connection.close(function (err) {
        if (err) return done(err)
        finish()
      })
    } else {
      finish()
    }
  }

  var getModel = function (modelName) {
    if (!models) {
      throw new Error('Models not initialised; call connect() first.')
    }
    var model = models[modelName]
    if (!model) {
      throw new Error('Model not initialised: ' + modelName)
    }
    return model
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
      var model = getModel(modelName)
      if (!model) return cb(new Error('Model not initialised: ' + modelName))
      model.deleteMany({}, cb)
    }

    // onsert all records for model one by one
    async.each(_.keys(models), iterator, callback)
  }

  var initialise = function (done) {
    if (!readyPromise) {
      connect(function (err) {
        if (err) return done(err)
        async.series([
          removeRecords,
          insertRecords
        ], done)
      })
      return
    }

    readyPromise.then(function () {
      async.series([
        removeRecords,
        insertRecords
      ], done)
    }).catch(done)
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
