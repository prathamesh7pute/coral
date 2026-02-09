const express = require('express')
const Query = require('../lib/query')
const SubDocQuery = require('../lib/subDocQuery')
const QueryConfig = require('../lib/queryConfig')

class Coral {
  constructor (config) {
    this.router = express.Router()
    this.query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model)
    this.middlewares = config.middlewares || []

    this.configureRouteWithIdAttribute(config)
    this.configureRouteWithoutIdAttribute(config)

    return this.router
  }

  configureRouteWithIdAttribute (config) {
    // with idAttribute
    this.router.route(config.path + '/:idAttribute')
      .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
      .get((req, res, next) => {
        this.query.findOne(req.coralQueryConfig)
      })
      .put((req, res, next) => {
        this.query.findOneAndUpdate(req.coralQueryConfig)
      })
      .delete((req, res, next) => {
        this.query.findOneAndRemove(req.coralQueryConfig)
      })
  }

  configureRouteWithoutIdAttribute (config) {
    this.router.route(config.path)
      .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
      .get((req, res, next) => {
        this.query.find(req.coralQueryConfig)
      })
      .post((req, res, next) => {
        this.query.create(req.coralQueryConfig)
      })
  }

  buildQueryConfig (config) {
    return (req, res, next) => {
      req.coralQueryConfig = QueryConfig(req, res, config)
      next()
    }
  }

  isMethodAllowed (config) {
    return (req, res, next) => {
      const isMethodAllowed = config.methods ? config.methods.includes(req.method) : true
      if (isMethodAllowed) {
        next()
      } else {
        res.status(404).end()
      }
    }
  }
}

// export Coral
exports = module.exports = Coral
