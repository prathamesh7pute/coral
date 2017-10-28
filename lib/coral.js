var express = require('express')
var Query = require('../lib/query')
var SubDocQuery = require('../lib/subDocQuery')
var QueryConfig = require('../lib/queryConfig')
var Router = express.Router

// export Coral
exports = module.exports = Coral

function Coral (config) {
  var router = new Router()
  var query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model)
  var middlewares = config.middlewares || []
  var queryConfig = {}

  var buildQueryConfig = function (req, res, next) {
    queryConfig = QueryConfig(req, res, config)
    next()
  }

  var isMethodAllowed = function (req, res, next) {
    var isMethodAllowed = config.methods ? config.methods.includes(req.method) : true
    if (isMethodAllowed) {
      next()
    } else {
      res.status(404).end()
    }
  }

  // with idAttribute
  router.route(config.path + '/:idAttribute')
    .all(isMethodAllowed, middlewares, buildQueryConfig)
    .get(function () {
      query.findOne(queryConfig)
    })
    .put(function () {
      query.findOneAndUpdate(queryConfig)
    })
    .delete(function () {
      query.findOneAndRemove(queryConfig)
    })

  // without idAttribute
  router.route(config.path)
    .all(isMethodAllowed, middlewares, buildQueryConfig)
    .get(function () {
      query.find(queryConfig)
    })
    .post(function () {
      query.create(queryConfig)
    })

  return router
}
