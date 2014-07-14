var _ = require('underscore'),
  express = require('express'),
  Query = require('../lib/query'),
  SubDocQuery = require('../lib/subDocQuery'),
  util = require('../lib/util'),
  Router = express.Router;

//export Coral   
exports = module.exports = Coral;

function Coral(config) {

  var router = new Router(),
    query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model),
    middlewares = config.middlewares || [],
    queryConfig = {};

  var buildQueryConfig = function(req, res, next) {
    queryConfig = util.queryConfig(req, res, config);
    next();
  };

  var isMethodAllowed = function(req, res, next) {
    var isMethodAllowed = config.methods ? _.contains(config.methods, req.method) : true;
    if (isMethodAllowed) {
      next();
    } else {
      res.send(404);
    }
  };

  // with idAttribute
  router.route(config.path + '/:idAttribute')
    .all(isMethodAllowed, middlewares, buildQueryConfig)
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
    .all(isMethodAllowed, middlewares, buildQueryConfig)
    .get(function() {
      query.find(queryConfig);
    })
    .post(function() {
      query.create(queryConfig);
    });

  return router;

}