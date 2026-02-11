import express from 'express';
import Query from './query.js';
import SubDocQuery from './subDocQuery.js';
import QueryConfig from './queryConfig.js';
class CoralRouter {
    router;
    query;
    middlewares;
    constructor(config) {
        this.router = express.Router();
        this.query = config.subDoc ? new SubDocQuery(config.model) : new Query(config.model);
        this.middlewares = config.middlewares || [];
        this.configureRouteWithIdAttribute(config);
        this.configureRouteWithoutIdAttribute(config);
    }
    configureRouteWithIdAttribute(config) {
        // with idAttribute
        this.router.route(config.path + '/:idAttribute')
            .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
            .get((req) => {
            this.query.findOne(req.coralQueryConfig);
        })
            .put((req) => {
            this.query.findOneAndUpdate(req.coralQueryConfig);
        })
            .delete((req) => {
            this.query.findOneAndRemove(req.coralQueryConfig);
        });
    }
    configureRouteWithoutIdAttribute(config) {
        this.router.route(config.path)
            .all(this.isMethodAllowed(config), this.middlewares, this.buildQueryConfig(config))
            .get((req) => {
            this.query.find(req.coralQueryConfig);
        })
            .post((req) => {
            this.query.create(req.coralQueryConfig);
        });
    }
    buildQueryConfig(config) {
        return (req, res, next) => {
            req.coralQueryConfig = QueryConfig(req, res, config);
            next();
        };
    }
    isMethodAllowed(config) {
        return (req, res, next) => {
            const isMethodAllowed = config.methods ? config.methods.includes(req.method) : true;
            if (isMethodAllowed) {
                next();
            }
            else {
                res.status(404).end();
            }
        };
    }
}
// export Coral
export default function Coral(config) {
    return new CoralRouter(config).router;
}
