const express = require('express')
const Query = require('../lib/query')
const SubDocQuery = require('../lib/subDocQuery')
const QueryConfig = require('../lib/queryConfig')

class Coral {
  constructor (config) {
    this.router = express.Router()
    this.query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model)
    this.middlewares = config.middlewares || []
    this.queryConfig = {}

    this.configureRouteWithIdAttribute(config)
    this.configureRouteWithoutIdAttribute(config)

    return this.router
  }

  configureRouteWithIdAttribute (config) {
    // with idAttribute
    this.router.route(config.path + '/:idAttribute')
    .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
    .get(() => {
      this.query.findOne(this.queryConfig)
    })
    .put(() => {
      this.query.findOneAndUpdate(this.queryConfig)
    })
    .delete(() => {
      this.query.findOneAndRemove(this.queryConfig)
    })
  }

  configureRouteWithoutIdAttribute (config) {
    this.router.route(config.path)
    .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
    .get(() => {
      this.query.find(this.queryConfig)
    })
    .post(() => {
      this.query.create(this.queryConfig)
    })
  }

  buildQueryConfig (config) {
    return (req, res, next) => {
      this.queryConfig = QueryConfig(req, res, config)
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
