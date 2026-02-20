import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Model, Types } from 'mongoose';
import type {
  QueryCallback,
  QueryConditions,
  QueryFields,
  QueryOptions,
  QueryPayload,
  QueryResult,
} from './query.ts';
import type { SubDocConfig, SubDocResult } from './subDoc.ts';

export type UpdateRefId = Types.ObjectId | string | null | undefined;
export type QueryParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | undefined;
export type ReferenceFieldValue = UpdateRefId | Array<UpdateRefId>;
export type CoralResult = QueryResult | SubDocResult;

export interface UpdateRefConfig {
  path: string;
  model: Model<object>;
  findOneId?: UpdateRefId | ((req: Request, res: Response) => UpdateRefId);
}

export interface QueryDefaults {
  conditions?: QueryConditions;
  options?: QueryOptions;
  fields?: QueryFields;
}

export interface CoralConfig {
  path: string;
  model: Model<object>;
  subDoc?: SubDocConfig;
  conditions?: QueryConditions;
  options?: QueryOptions;
  fields?: QueryFields;
  middlewares?: RequestHandler[];
  methods?: string[];
  idAttribute?: string;
  idParam?: string;
  perPage?: number;
  query?: QueryDefaults;
  updateRef?: UpdateRefConfig;
  bodyFilter?: string[];
}

export interface CoralQueryConfig {
  conditions: QueryConditions;
  fields: QueryFields;
  options: QueryOptions;
  data: QueryPayload;
  subDoc?: SubDocConfig;
  callback: QueryCallback;
}

export interface CoralRequest extends Request {
  coralQueryConfig?: CoralQueryConfig;
}

export interface CoralQueryService {
  find(config: CoralQueryConfig): Promise<CoralResult>;
  findOne(config: CoralQueryConfig): Promise<CoralResult>;
  create(config: CoralQueryConfig): Promise<CoralResult>;
  findOneAndUpdate(config: CoralQueryConfig): Promise<CoralResult>;
  findOneAndRemove(config: CoralQueryConfig): Promise<CoralResult>;
}

export type CoralRouteHandler = (req: Request, res: Response, next: NextFunction) => void;
