/*
 * these should export following functions
 * connect
 * disconnect
 * removeRecords
 * addRecords - actually these should be seperate
 */

var mongoose = require('mongoose'),
  _ = require('underscore'),
  async = require('async');

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

  var insertRecords = function(Model, data, done) {
    Model.create(data, done);
  };

  var removeRecords = function(done) {
    //iterator to remove docs for each model
    var iterator = function(modelName, callback) {
      getModel(modelName).remove(callback);
    };

    //remove all records for each model one by one
    async.eachSeries(_.keys(models), iterator, done);
  };

  return {
    connect: connect,
    disconnect: disconnect,
    getModel: getModel,
    insertRecords: insertRecords,
    removeRecords: removeRecords
  };
}