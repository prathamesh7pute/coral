import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import type {
  CoralConfig,
  CoralQueryConfig,
  CoralQueryService,
  CoralRequest,
} from './models/index.ts';
import Query from './query.ts';
import createQueryConfig from './queryConfig.ts';
import SubDocQuery from './subDocQuery.ts';

class CoralRouter {
  private readonly router: express.Router;
  private readonly query: CoralQueryService;
  private readonly middlewares: RequestHandler[];

  constructor(config: CoralConfig) {
    this.router = express.Router();
    this.query = this.createQueryService(config);
    this.middlewares = config.middlewares ?? [];

    this.configureRouteWithIdAttribute(config);
    this.configureRouteWithoutIdAttribute(config);
  }

  private createQueryService(config: CoralConfig): CoralQueryService {
    const queryService = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model);

    return {
      find: (queryConfig) => queryService.find(queryConfig),
      findOne: (queryConfig) => queryService.findOne(queryConfig),
      create: (queryConfig) => queryService.create(queryConfig),
      findOneAndUpdate: (queryConfig) => queryService.findOneAndUpdate(queryConfig),
      findOneAndRemove: (queryConfig) => queryService.findOneAndRemove(queryConfig),
    };
  }

  private getRequestConfig(req: Request): CoralQueryConfig {
    const config = (req as CoralRequest).coralQueryConfig;
    if (!config) {
      throw new Error('CoralQueryConfig is missing on request object');
    }
    return config;
  }

  getRouter() {
    return this.router;
  }

  private configureRouteWithIdAttribute(config: CoralConfig) {
    const path = `${config.path}/:idAttribute`;

    const queryFindOne: RequestHandler = (req) => {
      this.query.findOne(this.getRequestConfig(req));
    };

    const queryFindOneAndUpdate: RequestHandler = (req) => {
      this.query.findOneAndUpdate(this.getRequestConfig(req));
    };

    const queryFindOneAndRemove: RequestHandler = (req) => {
      this.query.findOneAndRemove(this.getRequestConfig(req));
    };

    this.router
      .route(path)
      .all(this.isMethodAllowed(config), ...this.middlewares, this.buildQueryConfig(config))
      .get(queryFindOne)
      .put(queryFindOneAndUpdate)
      .delete(queryFindOneAndRemove);
  }

  private configureRouteWithoutIdAttribute(config: CoralConfig) {
    const path = config.path;

    const queryFind: RequestHandler = (req) => {
      this.query.find(this.getRequestConfig(req));
    };

    const queryCreate: RequestHandler = (req) => {
      this.query.create(this.getRequestConfig(req));
    };

    this.router
      .route(path)
      .all(this.isMethodAllowed(config), ...this.middlewares, this.buildQueryConfig(config))
      .get(queryFind)
      .post(queryCreate);
  }

  private buildQueryConfig(config: CoralConfig): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      (req as CoralRequest).coralQueryConfig = createQueryConfig(req, res, config);
      next();
    };
  }

  private isMethodAllowed(config: CoralConfig): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const isMethodAllowed = config.methods ? config.methods.includes(req.method) : true;

      if (isMethodAllowed) {
        next();
        return;
      }

      res.status(404).end();
    };
  }
}

export default function Coral(config: CoralConfig) {
  return new CoralRouter(config).getRouter();
}
