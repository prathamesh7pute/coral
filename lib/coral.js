var Router = require('../lib/routes');

var Coral = function(app) {

  var router = new Router(app);

  var route = function(config) {
    var methods = config.methods,
      path = config.path,
      model = config.model,
      options = {
        findAll: config.findAll,
        perPage: config.perPage
      };

    if (!methods) {
      router.find(path, model, options);
      router.findById(path + '/:id', model);
      router.create(path, model);
      router.update(path + '/:id', model);
      router.remove(path + '/:id', model);
    }


  };

  return {
    route: route
  };

};

exports = module.exports = Coral;

exports.version = '0.1.3';