var Router = require('../lib/router');

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
      router.findOne(path + '/:id', model, idAttribute);
      router.update(path + '/:id', model, idAttribute);
      router.remove(path + '/:id', model, idAttribute);
    } else {

      if ( !! ~methods.indexOf('get')) {
        router.find(path, model, options);
        router.findOne(path + '/:id', model, idAttribute);
      }

      if ( !! ~methods.indexOf('post')) {
        router.create(path, model);
      }

      if ( !! ~methods.indexOf('put')) {
        router.update(path + '/:id', model, idAttribute);
      }

      if ( !! ~methods.indexOf('del')) {
        router.remove(path + '/:id', model, idAttribute);
      }

    }

  };

  return {
    route: route
  };

};

exports = module.exports = Coral;

exports.version = '0.1.9';