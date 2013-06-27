var Query = require('../lib/query'),
    util = require('../lib/util');

var callback = function (res) {
    return function (err, data) {
        if (!err) {
            return res.json(data);
        } else {
            return console.log(err);
        }
    };
};


var Routes = function (app) {

    var findAll = function (path, models) {
        app.get(path, function (req, res) {
            var query = new Query(models[0]);
            query.findAll({}, callback(res));
        });
    };

    var findById = function (path, models) {
        app.get(path, function (req, res) {
            var query = new Query(models[0]),
                params = util.getParams(path);
            query.findById(req.params[params[0]], callback(res));
        });
    };

    var create = function (path, models) {
        app.post(path, function (req, res) {
            var query = new Query(models[0]);
            query.create(req.body, callback(res));
        });
    };

    var update = function (path, models) {
        app.put(path, function (req, res) {
            var query = new Query(models[0]),
                params = util.getParams(path);
            query.findByIdAndUpdate(req.params[params[0]], req.body, callback(res));
        });
    };

    var remove = function (path, models) {
        app.del(path, function (req, res) {
            var query = new Query(models[0]),
                params = util.getParams(path);
            query.findByIdAndRemove(req.params[params[0]], callback(res));
        });
    };

    return {
        findAll: findAll,
        findById: findById,
        update: update,
        create: create,
        remove: remove
    };
};

module.exports = Routes;
