import type { Model } from 'mongoose';
import type {
  QueryCallback,
  QueryConfig,
  QueryDocument,
  QueryRecord,
  QueryResult,
  SubDocCallback,
  SubDocConditionValue,
  SubDocConfig,
  SubDocRecord,
  SubDocResult,
} from './models/index.ts';

function matchesConditions(
  candidate: SubDocRecord,
  conditions: Record<string, SubDocConditionValue>,
) {
  return Object.keys(conditions).every((key) => candidate[key] === conditions[key]);
}

function isSubDocRecord(value: SubDocResult): value is SubDocRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/*
 * provides sub-document query utility functions:
 * find / findOne / create / findOneAndUpdate / findOneAndRemove
 */
class SubDocQuery {
  private readonly model: Model<object>;

  constructor(model: Model<object>) {
    this.model = model;
  }

  private resolveCallback(
    configCallback?: QueryCallback,
    callback?: SubDocCallback,
  ): ((err: Error | null, data?: SubDocResult | QueryResult) => void) | undefined {
    if (configCallback) {
      return (err, data) => {
        configCallback(err, data as QueryResult);
      };
    }

    if (callback) {
      return (err, data) => {
        callback(err, data as SubDocResult);
      };
    }

    return undefined;
  }

  private async run(
    operation: () => Promise<SubDocResult>,
    callback?: (err: Error | null, data?: SubDocResult | QueryResult) => void,
  ): Promise<SubDocResult> {
    try {
      const result = await operation();
      if (callback) {
        callback(null, result);
        return undefined;
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unexpected sub-document query error');
      if (callback) {
        callback(error);
        return undefined;
      }
      throw error;
    }
  }

  private async findSubDoc(config: QueryConfig & { subDoc?: SubDocConfig }): Promise<{
    parent: QueryDocument;
    child: SubDocResult;
  } | null> {
    const parent = (await this.model
      .findOne(config.conditions, config.fields, config.options)
      .exec()) as QueryDocument | null;

    if (!parent) {
      return null;
    }

    let currentNode: SubDocRecord = parent as SubDocRecord;
    let child: SubDocResult;
    let subDoc = config.subDoc;

    while (subDoc) {
      const rawChild = currentNode[subDoc.path] as SubDocResult;
      child = rawChild;

      const subDocConditions = subDoc.conditions;
      if (Array.isArray(rawChild) && subDocConditions) {
        child = rawChild.find((entry) => matchesConditions(entry, subDocConditions));
      }

      if (!subDoc.subDoc) {
        return { parent, child };
      }

      if (!isSubDocRecord(child)) {
        return { parent, child: undefined };
      }

      currentNode = child;
      subDoc = subDoc.subDoc;
    }

    return { parent, child: undefined };
  }

  find(
    config: QueryConfig & { subDoc?: SubDocConfig },
    cb?: SubDocCallback,
  ): Promise<SubDocResult> {
    const callback = this.resolveCallback(config.callback, cb);
    return this.run(async () => {
      const result = await this.findSubDoc(config);
      return result?.child;
    }, callback);
  }

  findOne(
    config: QueryConfig & { subDoc?: SubDocConfig },
    cb?: SubDocCallback,
  ): Promise<SubDocResult> {
    const callback = this.resolveCallback(config.callback, cb);
    return this.run(async () => {
      const result = await this.findSubDoc(config);
      if (!result || Array.isArray(result.child)) {
        return undefined;
      }
      return result.child;
    }, callback);
  }

  create(
    config: QueryConfig & { subDoc?: SubDocConfig },
    data?: QueryRecord | Array<QueryRecord>,
    cb?: SubDocCallback,
  ): Promise<SubDocResult> {
    const callback = this.resolveCallback(config.callback, cb);
    const docData = config.data ?? data;

    return this.run(async () => {
      const result = await this.findSubDoc(config);
      if (!result || !Array.isArray(result.child) || !docData || Array.isArray(docData)) {
        return undefined;
      }

      result.child.push(docData as SubDocRecord);
      await result.parent.save();
      return result.child[result.child.length - 1];
    }, callback);
  }

  findOneAndUpdate(
    config: QueryConfig & { subDoc?: SubDocConfig },
    data?: QueryRecord | Array<QueryRecord>,
    cb?: SubDocCallback,
  ): Promise<SubDocResult> {
    const callback = this.resolveCallback(config.callback, cb);
    const docData = config.data ?? data;

    return this.run(async () => {
      const result = await this.findSubDoc(config);
      if (!result || !isSubDocRecord(result.child) || !docData || Array.isArray(docData)) {
        return undefined;
      }

      Object.assign(result.child, docData as SubDocRecord);
      await result.parent.save();
      return result.child;
    }, callback);
  }

  findOneAndRemove(
    config: QueryConfig & { subDoc?: SubDocConfig },
    cb?: SubDocCallback,
  ): Promise<SubDocResult> {
    const callback = this.resolveCallback(config.callback, cb);

    return this.run(async () => {
      const result = await this.findSubDoc(config);
      if (!result || !isSubDocRecord(result.child)) {
        return null;
      }

      const removableChild = result.child as { remove?: () => void; deleteOne?: () => void };
      if (typeof removableChild.remove === 'function') {
        removableChild.remove();
      } else if (typeof removableChild.deleteOne === 'function') {
        removableChild.deleteOne();
      }

      await result.parent.save();
      return null;
    }, callback);
  }
}

export default SubDocQuery;
