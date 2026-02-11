import express, { type Request, type Response, type NextFunction, type RequestHandler } from 'express'
import Query from './query.js'
import SubDocQuery from './subDocQuery.js'
import QueryConfig from './queryConfig.js'
import { Model } from 'mongoose'

// Define the shape of QueryConfig result (imported or redefined if not exported types)
// Ideally QueryConfig should export its result type.
// For now, I'll rely on type inference or `any` for the config object but strict for req/res.
// Actually QueryConfig returns `QueryConfigResult`.

type CoralConfig = {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subDoc?: any
  middlewares?: RequestHandler[]
  methods?: string[]
  idAttribute?: string
  idParam?: string
  perPage?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateRef?: any
}

interface CoralRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coralQueryConfig?: any
}

class CoralRouter {
  router: express.Router
  query: Query | SubDocQuery
  middlewares: RequestHandler[]

  constructor(config: CoralConfig) {
    this.router = express.Router()
     
    this.query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model)
    this.middlewares = config.middlewares || []

    this.configureRouteWithIdAttribute(config)
    this.configureRouteWithoutIdAttribute(config)
  }

  configureRouteWithIdAttribute(config: CoralConfig) {
    // with idAttribute
    const path = config.path + '/:idAttribute'

    // Type safer wrappers
    const queryFindOne: RequestHandler = (req, _res, _next) => {
      this.query.findOne((req as CoralRequest).coralQueryConfig)
    }

    const queryFindOneAndUpdate: RequestHandler = (req, _res, _next) => {
      this.query.findOneAndUpdate((req as CoralRequest).coralQueryConfig)
    }

    const queryFindOneAndRemove: RequestHandler = (req, _res, _next) => {
      this.query.findOneAndRemove((req as CoralRequest).coralQueryConfig)
    }

    this.router.route(path)
      .all(this.isMethodAllowed(config), ...this.middlewares, this.buildQueryConfig(config))
      .get(queryFindOne)
      .put(queryFindOneAndUpdate)
      .delete(queryFindOneAndRemove)
  }

  configureRouteWithoutIdAttribute(config: CoralConfig) {
    const path = config.path

    const queryFind: RequestHandler = (req, _res, _next) => {
      this.query.find((req as CoralRequest).coralQueryConfig)
    }

    const queryCreate: RequestHandler = (req, _res, _next) => {
       
      this.query.create((req as CoralRequest).coralQueryConfig)
    }

    this.router.route(path)
      .all(this.isMethodAllowed(config), ...this.middlewares, this.buildQueryConfig(config))
      .get(queryFind)
      .post(queryCreate)
  }

  buildQueryConfig(config: CoralConfig): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as CoralRequest).coralQueryConfig = QueryConfig(req, res, config as any)
      next()
    }
  }

  isMethodAllowed(config: CoralConfig): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
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
export default function Coral(config: CoralConfig) {
  return new CoralRouter(config).router
}
