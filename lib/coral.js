var _ = require('underscore'),
  express = require('express'),
  Query = require('../lib/query'),
  util = require('../lib/util'),
  Router = express.Router;

//export Coral   
exports = module.exports = Coral;

function Coral(config) {

  var router = new Router(),
    query = new Query(config.model);

  router.route(config.path + '/:idAttribute')
    .get(function(req, res, next) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOne(queryConfig, util.callback(res));
    })
    .put(function(req, res, next) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOneAndUpdate(queryConfig, req.body, util.callback(res));
    })
    .delete(function(req, res, next) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOneAndRemove(queryConfig, util.callback(res));
    });

  router.route(config.path)
    .get(function(req, res) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.find(queryConfig, util.callback(res));
    })
    .post(function(req, res, next) {
      query.create(req.body, util.callback(res));
    });

  return router;

}

//_.contains(config.methods, 'post')