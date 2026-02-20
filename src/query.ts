import type { Model } from 'mongoose';
import type {
  QueryCallback,
  QueryConfig,
  QueryDocument,
  QueryPayload,
  QueryResult,
} from './models/index.ts';

/*
 * provides the following database utility functions:
 * find / findOne / create / findOneAndUpdate / findOneAndRemove
 */
class Query {
  private readonly model: Model<object>;

  constructor(model: Model<object>) {
    this.model = model;
  }

  private async run(
    operation: () => Promise<QueryResult>,
    callback?: QueryCallback,
  ): Promise<QueryResult> {
    try {
      const result = await operation();
      if (callback) {
        callback(null, result);
        return undefined;
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unexpected query error');
      if (callback) {
        callback(error);
        return undefined;
      }
      throw error;
    }
  }

  find(config: QueryConfig, cb?: QueryCallback): Promise<QueryResult> {
    const callback = config.callback ?? cb;
    return this.run(async () => {
      const records = await this.model
        .find(config.conditions, config.fields, config.options)
        .exec();
      return records as Array<QueryDocument>;
    }, callback);
  }

  findOne(config: QueryConfig, cb?: QueryCallback): Promise<QueryResult> {
    const callback = config.callback ?? cb;
    return this.run(async () => {
      const record = await this.model
        .findOne(config.conditions, config.fields, config.options)
        .exec();
      return record as QueryDocument | null;
    }, callback);
  }

  create(config: QueryConfig, data?: QueryPayload, cb?: QueryCallback): Promise<QueryResult> {
    const callback = config.callback ?? cb;
    const docData = config.data ?? data;

    if (Array.isArray(docData) && docData.length === 0) {
      if (callback) {
        callback(null, undefined);
      }
      return Promise.resolve(undefined);
    }

    if (!docData) {
      if (callback) {
        callback(null, undefined);
      }
      return Promise.resolve(undefined);
    }

    return this.run(async () => {
      if (Array.isArray(docData)) {
        const createdMany = await this.model.create(docData);
        return createdMany as Array<QueryDocument>;
      }
      const createdOne = await this.model.create(docData);
      return createdOne as QueryDocument;
    }, callback);
  }

  findOneAndUpdate(
    config: QueryConfig,
    data?: QueryPayload,
    cb?: QueryCallback,
  ): Promise<QueryResult> {
    const callback = config.callback ?? cb;
    const docData = config.data ?? data;

    return this.run(async () => {
      const doc = (await this.model
        .findOne(config.conditions, config.fields, config.options)
        .exec()) as QueryDocument | null;
      if (!doc) {
        return null;
      }

      if (docData && !Array.isArray(docData)) {
        Object.assign(doc, docData);
      }

      await doc.save();
      return doc;
    }, callback);
  }

  findOneAndRemove(config: QueryConfig, cb?: QueryCallback): Promise<QueryResult> {
    const callback = config.callback ?? cb;
    return this.run(async () => {
      const doc = (await this.model
        .findOne(config.conditions, config.fields, config.options)
        .exec()) as QueryDocument | null;
      if (!doc) {
        return null;
      }

      await doc.deleteOne();
      return doc;
    }, callback);
  }
}

export default Query;
