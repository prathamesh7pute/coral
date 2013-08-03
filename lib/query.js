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
      cb(null, []);
    }
  };

  var findOne = function(identifier, cb) {
    Model.findOne(identifier, cb);
  };

  var create = function(data, cb) {
    Model.create(data, cb);
  };

  var findOneAndUpdate = function(identifier, data, cb) {
    Model.findOneAndUpdate(identifier, data, cb);
  };

  var findOneAndRemove = function(identifier, cb) {
    Model.findOneAndRemove(identifier, cb);
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