import type {
  HydratedDocument,
  QueryOptions as MongooseQueryOptions,
  ProjectionType,
  QueryFilter,
  Types,
} from 'mongoose';

export interface QueryRecord {
  [key: string]: QueryValue | undefined;
}

export type QueryScalar = boolean | Date | null | number | string | Types.ObjectId;
export type QueryValue = QueryScalar | QueryRecord | Array<QueryScalar> | Array<QueryRecord>;

export type QueryPayload = QueryRecord | Array<QueryRecord> | undefined;
export type QueryDocument = HydratedDocument<QueryRecord>;
export type QueryResult = QueryDocument | Array<QueryDocument> | null | undefined;
export type QueryFields = ProjectionType<object> | string;
export type QueryConditions = QueryFilter<object>;
export type QueryOptions = MongooseQueryOptions<object>;
export type QueryCallback = (err: Error | null, data?: QueryResult) => void;

export interface QueryConfig {
  conditions?: QueryConditions;
  fields?: QueryFields;
  options?: QueryOptions;
  data?: QueryPayload;
  callback?: QueryCallback;
}
