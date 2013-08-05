var Router = require('../lib/router'),
  _ = require('underscore');

var Coral = function(app) {

  var router = new Router(app);

  var route = function(config) {
    var methods = config.methods,
      path = config.path,
      model = config.model,
      idAttribute = config.idAttribute || '_id',
      options = {
        findAll: config.findAll,
        perPage: config.perPage
      };

    if (!methods) {
      router.find(path, model, options);
      router.create(path, model);
      router.findOne(path, model, idAttribute);
      router.update(path, model, idAttribute);
      router.remove(path, model, idAttribute);
    } else {

      if (_.contains(methods, 'get')) {
        router.find(path, model, options);
        router.findOne(path, model, idAttribute);
      }

      if (_.contains(methods, 'post')) {
        router.create(path, model);
      }

      if (_.contains(methods, 'put')) {
        router.update(path, model, idAttribute);
      }

      if (_.contains(methods, 'del')) {
        router.remove(path, model, idAttribute);
      }

    }

  };

  return {
    route: route
  };

};

exports = module.exports = Coral;

exports.version = '0.2.1';