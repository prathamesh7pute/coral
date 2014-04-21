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
      queryConfig = util.buildQueryConfig(req, config);
      next();
    } else {
      res.send(404);
    }
  };

  // with idAttribute
  router.route(config.path + '/:idAttribute')
    .all(buildQueryConfig)
    .get(function(req, res, next) {
      query.findOne(queryConfig, util.callback(res));
    })
    .put(function(req, res, next) {
      query.findOneAndUpdate(queryConfig, req.body, util.callback(res));
    })
    .delete(function(req, res, next) {
      query.findOneAndRemove(queryConfig, util.callback(res));
    });


  // for paths without idAttribute
  router.route(config.path)
    .all(buildQueryConfig)
    .get(function(req, res, next) {
      query.find(queryConfig, util.callback(res));
    })
    .post(function(req, res, next) {
      query.create(req.body, util.callback(res));
    });

  return router;

}