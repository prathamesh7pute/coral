var _ = require('underscore'),
  express = require('express'),
  Query = require('../lib/query'),
  util = require('../lib/util'),
  Router = express.Router;

//export Coral   
exports = module.exports = Coral;

function Coral(config) {

  var router = new Router(),
    query = new Query(config.model),
    queryConfig;

  var buildQueryConfig = function(req, res, next) {
    var isMethodAllowed = config.methods ? _.contains(config.methods, req.method) : true;
    if (isMethodAllowed) {
      queryConfig = util.buildQueryConfig(req, res, config);
      next();
    } else {
      res.send(404);
    }
  };

  // with idAttribute
  router.route(config.path + '/:idAttribute')
    .all(buildQueryConfig)
    .get(function() {
      query.findOne(queryConfig);
    })
    .put(function() {
      query.findOneAndUpdate(queryConfig);
    })
    .delete(function() {
      query.findOneAndRemove(queryConfig);
    });


  // without idAttribute
  router.route(config.path)
    .all(buildQueryConfig)
    .get(function() {
      query.find(queryConfig);
    })
    .post(function() {
      query.create(queryConfig.data, queryConfig.callback);
    });

  return router;

}