var Router = require('../lib/router'),
  _ = require('underscore');

var Coral = function(app) {

  var route = function(config) {
    var router = new Router(app),
      methods = config.methods;

    if (!methods) {
      router.find(config);
      router.create(config);
      router.findOne(config);
      router.update(config);
      router.remove(config);
    } else {

      if (_.contains(methods, 'get')) {
        router.find(config);
        router.findOne(config);
      }

      if (_.contains(methods, 'post')) {
        router.create(config);
      }

      if (_.contains(methods, 'put')) {
        router.update(config);
      }

      if (_.contains(methods, 'del')) {
        router.remove(config);
      }

    }

  };

  return {
    route: route
  };

};

exports = module.exports = Coral;

exports.version = '0.2.2';