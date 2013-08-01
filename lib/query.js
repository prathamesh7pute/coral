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

  var findById = function(id, cb) {
    Model.findById(id, cb);
  };

  var create = function(data, cb) {
    Model.create(data, cb);
  };

  var findByIdAndUpdate = function(id, data, cb) {
    Model.findByIdAndUpdate(id, data, cb);
  };

  var findByIdAndRemove = function(id, cb) {
    Model.findByIdAndRemove(id, cb);
  };

  return {
    find: find,
    findById: findById,
    create: create,
    findByIdAndUpdate: findByIdAndUpdate,
    findByIdAndRemove: findByIdAndRemove
  };
};

module.exports = Query;