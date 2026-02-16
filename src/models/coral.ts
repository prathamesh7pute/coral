import type {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express'
import type { Model } from 'mongoose'
import type {
  QueryCallback,
  QueryConditions,
  QueryFields,
  QueryOptions
} from './query.js'
import type { SubDocConfig } from './subDoc.js'

export interface UpdateRefConfig {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>
  findOneId?: unknown | ((req: Request, res: Response) => unknown)
}

export interface QueryDefaults {
  conditions?: QueryConditions
  options?: QueryOptions
  fields?: QueryFields
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CoralConfig<TModel = any> {
  path: string
  model: Model<TModel>
  subDoc?: SubDocConfig
  conditions?: QueryConditions
  options?: QueryOptions
  fields?: QueryFields
  middlewares?: RequestHandler[]
  methods?: string[]
  idAttribute?: string
  idParam?: string
  perPage?: number
  query?: QueryDefaults
  updateRef?: UpdateRefConfig
}

export interface CoralQueryConfig {
  conditions: QueryConditions
  fields: QueryFields
  options: QueryOptions
  data: unknown
  subDoc?: SubDocConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: QueryCallback<any>
}

export interface CoralRequest extends Request {
  coralQueryConfig?: CoralQueryConfig
}

export interface CoralQueryService {
  find(config: CoralQueryConfig): Promise<unknown> | void
  findOne(config: CoralQueryConfig): Promise<unknown> | void
  create(config: CoralQueryConfig): Promise<unknown> | void
  findOneAndUpdate(config: CoralQueryConfig): Promise<unknown> | void
  findOneAndRemove(config: CoralQueryConfig): Promise<unknown> | void
}

export type CoralRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void
