var _ = require('underscore');

var Query = function(Model) {

  var find = function(options, cb) {
    if (options.skip && options.limit) {
      Model.find(options.filter)
        .sort(options.sort)
        .select(options.select)
        .skip(options.skip)
        .limit(options.limit)
        .execFind(cb);
    } else if (options.findAll) {
      Model.find(options.filter)
        .sort(options.sort)
        .select(options.select)
        .execFind(cb);
    } else {
      cb(null, null);
    }
  };

  var findOne = function(identifier, cb) {
    Model.findOne(identifier, cb);
  };

  var create = function(data, cb) {
    Model.create(data, cb);
  };

  var findOneAndUpdate = function(identifier, data, cb) {
    Model.findOne(identifier, function(err, doc) {
      if (err) {
        cb(err, null);
      }
      if (doc) {
        doc = _.extend(doc, data);
        doc.save(cb);
      } else {
        cb(null, null);
      }
    });
  };

  var findOneAndRemove = function(identifier, cb) {
    Model.findOne(identifier, function(err, doc) {
      if (err) {
        cb(err, null);
      }
      if (doc) {
        doc.remove(cb);
      } else {
        cb(null, null);
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
};

module.exports = Query;