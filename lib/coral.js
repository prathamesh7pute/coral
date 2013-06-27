var Routes = require('../lib/routes');

var Coral = function (app) {

    var routes = new Routes(app),

        route = function (conf) {
            var path = conf.path,
                methods = conf.methods,
                models = conf.models,
                findAll = conf.findAll;

            routes.findAll(path, models);
            routes.findById(path + '/:id', models);
            routes.create(path, models);
            routes.update(path + '/:id', models);
            routes.remove(path + '/:id', models);
        };

    return {
        route: route
    };

};

exports = module.exports = Coral;

exports.version = '0.1.0';
