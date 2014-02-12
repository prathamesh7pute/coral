var Router = require('../lib/router'),
  _ = require('underscore');

//export Coral   
exports = module.exports = Coral;

function Coral(app) {

  var route = function(config) {

    var router = new Router(app),
      methods = config.methods;

    if (!methods) {
      router.get(config);
      router.post(config);
      router.put(config);
      router.del(config);
    } else {

      if (_.contains(methods, 'get')) {
        router.get(config);
      }

      if (_.contains(methods, 'post')) {
        router.post(config);
      }

      if (_.contains(methods, 'put')) {
        router.put(config);
      }

      if (_.contains(methods, 'del')) {
        router.del(config);
      }

    }

  };

  return {
    route: route
  };

}