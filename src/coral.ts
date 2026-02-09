import express from 'express'
import Query from './query.js'
import SubDocQuery from './subDocQuery.js'
import QueryConfig from './queryConfig.js'

type CoralConfig = {
  path: string
  model: any
  subDoc?: any
  middlewares?: any[]
  methods?: string[]
  idAttribute?: string
  idParam?: string
  perPage?: number
  query?: any
  updateRef?: any
}

class CoralRouter {
  router: express.Router
  query: Query | SubDocQuery
  middlewares: any[]

  constructor (config: CoralConfig) {
    this.router = express.Router()
    this.query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model)
    this.middlewares = config.middlewares || []

    this.configureRouteWithIdAttribute(config)
    this.configureRouteWithoutIdAttribute(config)
  }

  configureRouteWithIdAttribute (config: CoralConfig) {
    // with idAttribute
    this.router.route(config.path + '/:idAttribute')
      .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
      .get((req) => {
        this.query.findOne((req as any).coralQueryConfig)
      })
      .put((req) => {
        this.query.findOneAndUpdate((req as any).coralQueryConfig)
      })
      .delete((req) => {
        this.query.findOneAndRemove((req as any).coralQueryConfig)
      })
  }

  configureRouteWithoutIdAttribute (config: CoralConfig) {
    this.router.route(config.path)
      .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
      .get((req) => {
        this.query.find((req as any).coralQueryConfig)
      })
      .post((req) => {
        this.query.create((req as any).coralQueryConfig)
      })
  }

  buildQueryConfig (config: CoralConfig) {
    return (req: any, res: any, next: any) => {
      req.coralQueryConfig = QueryConfig(req, res, config)
      next()
    }
  }

  isMethodAllowed (config: CoralConfig) {
    return (req: any, res: any, next: any) => {
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
export default function Coral (config: CoralConfig) {
  return new CoralRouter(config).router
}
