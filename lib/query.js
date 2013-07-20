var Query = function(Model) {

  var find = function(options, cb) {
    if (options.page) {
      if (options.sort) {
        Model.find({}).sort(options.sort).skip(options.page * options.perPage).limit(options.perPage).execFind(cb);
      } else {
        Model.find({}).skip(options.page * options.perPage).limit(options.perPage).execFind(cb);
      }
    } else if (options.skip && options.limit) {
      if (options.sort) {
        Model.find({}).sort(options.sort).skip(options.skip).limit(options.limit).execFind(cb);
      } else {
        Model.find({}).skip(options.skip).limit(options.limit).execFind(cb);
      }
    } else if (options.findAll) {
      if (options.sort) {
        Model.find({}).sort(options.sort).execFind(cb);
      } else {
        Model.find({}, cb);
      }
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