const express = require('express');
const Query = require('../lib/query');
const SubDocQuery = require('../lib/subDocQuery');
const QueryConfig = require('../lib/queryConfig');
const Router = express.Router;

//export Coral   
exports = module.exports = Coral;

const Coral = config => {

  var router = new Router(),
    query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model),
    middlewares = config.middlewares || [],
    queryConfig = {};

  var buildQueryConfig = function (req, res, next) {
    queryConfig = QueryConfig(req, res, config);
    next();
  };

  var isMethodAllowed = function (req, res, next) {
    var isMethodAllowed = config.methods ? config.methods.includes(req.method) : true;
    if (isMethodAllowed) {
      next();
    } else {
      res.status(404).end();
    }
  };

  // with idAttribute
  router.route(config.path + '/:idAttribute')
    .all(isMethodAllowed, middlewares, buildQueryConfig)
    .get(function () {
      query.findOne(queryConfig);
    })
    .put(function () {
      query.findOneAndUpdate(queryConfig);
    })
    .delete(function () {
      query.findOneAndRemove(queryConfig);
    });


  // without idAttribute
  router.route(config.path)
    .all(isMethodAllowed, middlewares, buildQueryConfig)
    .get(function () {
      query.find(queryConfig);
    })
    .post(function () {
      query.create(queryConfig);
    });

  return router;

}