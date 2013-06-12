var Query = function(Model) {

    var findAll = function(matcher, cb) {
        Model.find(matcher, cb);
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
        findAll: findAll,
        findById: findById,
        create: create,
        findByIdAndUpdate: findByIdAndUpdate,
        findByIdAndRemove: findByIdAndRemove
    };
};

module.exports = Query;
