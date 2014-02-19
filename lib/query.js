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
 * change this to mongoose like API - conditions, fields, options, callback
 */
function Query(Model) {

  //find all available records
  var find = function(options, cb) {
    if (options.skip && options.limit) {
      Model.find(options.filter)
        .sort(options.sort)
        .select(options.select)
        .skip(options.skip)
        .limit(options.limit)
        .populate(options.populate || '') //populate requires string
      .exec(cb);
    } else if (options.findAll) {
      Model.find(options.filter)
        .sort(options.sort)
        .select(options.select)
        .populate(options.populate || '') //populate requires string 
      .exec(cb);
    } else {
      cb();
    }
  };

  //find one specific record
  var findOne = function(options, cb) {
    Model.findOne(options.identifier)
      .select(options.select)
      .populate(options.populate || '') //populate requires string 
    .exec(cb);
  };

  //creates the one specific record
  var create = function(data, cb) {
    Model.create(data, cb);
  };

  //updates the one specific record
  var findOneAndUpdate = function(identifier, data, cb) {
    Model.findOne(identifier, function(err, doc) {
      if (err) {
        cb(err);
      }
      if (doc) {
        doc = _.extend(doc, data);
        doc.save(cb);
      } else {
        //no records
        cb();
      }
    });
  };

  //removes the one specific record
  var findOneAndRemove = function(identifier, cb) {
    Model.findOne(identifier, function(err, doc) {
      if (err) {
        cb(err);
      }
      if (doc) {
        doc.remove(cb);
      } else {
        //no records
        cb();
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