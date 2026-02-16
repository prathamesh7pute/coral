import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response
} from 'express'
import Query from './query.js'
import SubDocQuery from './subDocQuery.js'
import createQueryConfig from './queryConfig.js'
import type {
  CoralConfig,
  CoralQueryService,
  CoralRequest
} from './models/coral.js'

class CoralRouter<TModel = unknown> {
  private readonly router: express.Router
  private readonly query: CoralQueryService
  private readonly middlewares: RequestHandler[]

  constructor(config: CoralConfig<TModel>) {
    this.router = express.Router()
    this.query = config.subDoc
      ? new SubDocQuery<TModel>(config.model)
      : new Query<TModel>(config.model)
    this.middlewares = config.middlewares ?? []

    this.configureRouteWithIdAttribute(config)
    this.configureRouteWithoutIdAttribute(config)
  }

  getRouter() {
    return this.router
  }

  private configureRouteWithIdAttribute(config: CoralConfig<TModel>) {
    const path = `${config.path}/:idAttribute`

    const queryFindOne: RequestHandler = (req) => {
      this.query.findOne((req as CoralRequest).coralQueryConfig!)
    }

    const queryFindOneAndUpdate: RequestHandler = (req) => {
      this.query.findOneAndUpdate((req as CoralRequest).coralQueryConfig!)
    }

    const queryFindOneAndRemove: RequestHandler = (req) => {
      this.query.findOneAndRemove((req as CoralRequest).coralQueryConfig!)
    }

    this.router
      .route(path)
      .all(
        this.isMethodAllowed(config),
        ...this.middlewares,
        this.buildQueryConfig(config)
      )
      .get(queryFindOne)
      .put(queryFindOneAndUpdate)
      .delete(queryFindOneAndRemove)
  }

  private configureRouteWithoutIdAttribute(config: CoralConfig<TModel>) {
    const path = config.path

    const queryFind: RequestHandler = (req) => {
      this.query.find((req as CoralRequest).coralQueryConfig!)
    }

    const queryCreate: RequestHandler = (req) => {
      this.query.create((req as CoralRequest).coralQueryConfig!)
    }

    this.router
      .route(path)
      .all(
        this.isMethodAllowed(config),
        ...this.middlewares,
        this.buildQueryConfig(config)
      )
      .get(queryFind)
      .post(queryCreate)
  }

  private buildQueryConfig(config: CoralConfig<TModel>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      ;(req as CoralRequest).coralQueryConfig = createQueryConfig(req, res, config)
      next()
    }
  }

  private isMethodAllowed(config: CoralConfig<TModel>): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const isMethodAllowed = config.methods
        ? config.methods.includes(req.method)
        : true

      if (isMethodAllowed) {
        next()
        return
      }

      res.status(404).end()
    }
  }
}

export default function Coral<TModel = unknown>(config: CoralConfig<TModel>) {
  return new CoralRouter<TModel>(config).getRouter()
}
