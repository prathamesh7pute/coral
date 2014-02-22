/*
 * Query.js
 * provides the following database utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 * Todo - mongoose population support
 */

var _ = require('underscore');

/*
 * Exports the Query Object with utility functions
 */
module.exports = Query;

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
function Query(Model) {

  //find all available records
  var find = function(config, cb) {
    Model.find(config.conditions, config.fields, config.options, cb);
  };

  //find one specific record
  var findOne = function(config, cb) {
    Model.findOne(config.conditions, config.fields, config.options, cb);
  };

  //creates the one specific record
  var create = function(data, cb) {
    Model.create(data, cb);
  };

  //updates the one specific record
  var findOneAndUpdate = function(config, data, cb) {
    Model.findOne(config.conditions, config.fields, config.options, function(err, doc) {
      if (doc) {
        doc = _.extend(doc, data);
        doc.save(cb);
      } else {
        cb(err); //error or no docs
      }
    });
  };

  //removes the one specific record
  var findOneAndRemove = function(config, cb) {
    Model.findOne(config.conditions, config.fields, config.options, function(err, doc) {
      if (doc) {
        doc.remove(cb);
      } else {
        cb(err); //error or no docs
      }
    });
  };

  return {
    find: find,
    findOne: findOne,
    create: create,
    findOneAndUpdate: findOneAndUpdate,
    findOneAndRemove: findOneAndRemove
  };
}