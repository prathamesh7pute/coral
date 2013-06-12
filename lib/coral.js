var Routes = require('../lib/routes');

var Coral = function(app) {
    var routes = new Routes(app);

    var create = function(conf) {
        var path = conf.path,
            methods = conf.methods,
            params = conf.params,
            models = conf.models,
            findAll = conf.findAll;

        routes.findAll(path, models);
        routes.findById(path + '/:' + params[0], params, models);
        routes.create(path, models);
        routes.update(path + '/:' + params[0], params, models);
        routes.remove(path + '/:' + params[0], params, models);
    };

    return {
        create: create
    };

};

exports = module.exports = Coral;

exports.version = '0.1.0';
