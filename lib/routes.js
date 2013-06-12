var Query = require('../lib/query');

var Routes = function(app) {

    var findAll = function(path, models) {
        app.get(path, function(req, res) {
            var query = new Query(models[0]);
            query.findAll({}, function(err, data) {
                if (!err) {
                    return res.json(data);
                } else {
                    return console.log(err);
                }
            });
        });
    };

    var findById = function(path, params, models) {
        app.get(path, function(req, res) {
            var query = new Query(models[0]);
            query.findById(req.params[params[0]], function(err, data) {
                if (!err) {
                    return res.json(data);
                } else {
                    return console.log(err);
                }
            });
        });
    };

    var create = function(path, models) {
        app.post(path, function(req, res) {
            var query = new Query(models[0]);
            query.create(req.body, function(err, data) {
                if (!err) {
                    return res.json(data);
                } else {
                    return console.log(err);
                }
            });
        });
    };

    var update = function(path, params, models) {
        app.put(path, function(req, res) {
            var query = new Query(models[0]);
            query.findByIdAndUpdate(req.params[params[0]], req.body, function(err, data) {
                if (!err) {
                    return res.json(data);
                } else {
                    return console.log(err);
                }
            });
        });
    };

    var remove = function(path, params, models) {
        app.del(path, function(req, res) {
            var query = new Query(models[0]);
            query.findByIdAndRemove(req.params[params[0]], function(err, data) {
                if (!err) {
                    return res.end();
                } else {
                    return console.log(err);
                }
            });
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
