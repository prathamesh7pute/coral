/*
 * these should export following functions
 * connect
 * disconnect
 * removeRecords
 * initiase with sample records
 * addRecords - actually these should be seperate
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

    var insert = function(modelName, data) {
      return function(done) {
        var iterator = function(data, cb) {
          getModel(modelName).create(data, function(err, records) {
            if (err) {
              cb(err);
            }
            cb();
          });
        };
        async.eachSeries(data, iterator, done);
      };
    };

    async.series([
      insert('User', testData.users),
      insert('Article', testData.articles)
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