import type { Request, Response } from 'express';
import type { Document } from 'mongoose';
import type {
  CoralConfig,
  CoralQueryConfig,
  CoralResult,
  QueryConditions,
  QueryDefaults,
  QueryOptions,
  QueryParamValue,
  QueryPayload,
  QueryRecord,
  ReferenceFieldValue,
  SubDocConfig,
  UpdateRefConfig,
  UpdateRefId,
} from './models/index.ts';

function getQueryString(value: QueryParamValue): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const firstValue = value[0];
    return firstValue === undefined ? undefined : String(firstValue);
  }
  return String(value);
}

function parseQueryNumber(value: QueryParamValue) {
  const queryValue = getQueryString(value);
  if (!queryValue) {
    return undefined;
  }

  const parsed = Number.parseInt(queryValue, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function cloneSubDoc(subDoc?: SubDocConfig): SubDocConfig | undefined {
  if (!subDoc) return undefined;

  const cloned: SubDocConfig = { ...subDoc };
  if (subDoc.conditions) {
    cloned.conditions = { ...subDoc.conditions };
  }
  if (subDoc.subDoc) {
    cloned.subDoc = cloneSubDoc(subDoc.subDoc);
  }

  return cloned;
}

function getQueryDefaults(config: CoralConfig): Required<QueryDefaults> {
  const baseConditions = (config.conditions ?? {}) as QueryConditions;
  const baseOptions = (config.options ?? {}) as QueryOptions;
  const baseFields = config.fields ?? '';

  return {
    conditions: {
      ...baseConditions,
      ...(config.query?.conditions ?? {}),
    } as QueryConditions,
    options: {
      ...baseOptions,
      ...(config.query?.options ?? {}),
    } as QueryOptions,
    fields: config.query?.fields ?? baseFields,
  };
}

function getFindOneId(req: Request, res: Response, updateRef: UpdateRefConfig) {
  if (typeof updateRef.findOneId === 'function') {
    return updateRef.findOneId(req, res);
  }

  return updateRef.findOneId;
}

function getPathParamValue(req: Request, key: string) {
  const paramValue = req.params[key];
  if (Array.isArray(paramValue)) {
    return paramValue[0];
  }
  return paramValue;
}

function getCreatedDocumentId(data: CoralResult): UpdateRefId {
  if (!data || Array.isArray(data) || typeof data !== 'object' || !('_id' in data)) {
    return undefined;
  }

  return data._id as UpdateRefId;
}

function toPublicError(fallbackMessage: string): { message: string } {
  return { message: fallbackMessage };
}

function createCallback(req: Request, res: Response, updateRef?: UpdateRefConfig) {
  return async function callback(err: Error | null, data?: CoralResult) {
    if (err) {
      res.status(400).json(toPublicError('Request failed'));
      return;
    }

    if (!data || !updateRef || req.method !== 'POST') {
      res.json(data);
      return;
    }

    try {
      const createdDocumentId = getCreatedDocumentId(data);
      if (!createdDocumentId) {
        res.status(400).json({ message: 'Created document id is missing' });
        return;
      }

      const findOneId = getFindOneId(req, res, updateRef);
      if (!findOneId) {
        res.status(400).json({ message: 'Reference id is missing' });
        return;
      }

      const doc = await updateRef.model.findById(findOneId).exec();

      if (!doc) {
        res.status(404).json({ message: 'Reference document not found' });
        return;
      }

      const referenceDocument = doc as Record<string, ReferenceFieldValue>;
      const target = referenceDocument[updateRef.path];
      if (Array.isArray(target)) {
        target.push(createdDocumentId);
      } else {
        referenceDocument[updateRef.path] = createdDocumentId;
      }

      await (doc as Document).save();
      res.json(data);
    } catch {
      res.status(400).json(toPublicError('Reference update failed'));
    }
  };
}

/*
 * returns query configuration object used by Query/SubDocQuery
 */
export default function createQueryConfig(
  req: Request,
  res: Response,
  config: CoralConfig,
): CoralQueryConfig {
  const query = req.query as Record<string, QueryParamValue>;
  const sort = getQueryString(query.sort);
  const order = getQueryString(query.order);
  const select = getQueryString(query.select);
  const skip = parseQueryNumber(query.skip);
  const limit = parseQueryNumber(query.limit);
  const page = parseQueryNumber(query.page);

  const perPage = config.perPage ?? 10;
  const defaults = getQueryDefaults(config);
  const conditions = defaults.conditions;
  const options = defaults.options;
  let fields = defaults.fields;

  const subDocRoot = cloneSubDoc(config.subDoc);
  let subDoc = subDocRoot;

  let idAttribute = config.idParam
    ? getPathParamValue(req, config.idParam)
    : getPathParamValue(req, 'idAttribute');

  if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
    options.sort = `-${sort}`;
  } else if (sort && (order === 'asc' || order === 'ascending' || order === '1')) {
    options.sort = sort;
  }

  if (skip) {
    options.skip = skip;
  }

  if (limit) {
    const maxLimit = config.perPage ? config.perPage * 10 : 100;
    options.limit = Math.min(limit, maxLimit);
  }

  if (page) {
    options.skip = page * perPage;
    options.limit = perPage;
  }

  if (idAttribute) {
    (conditions as Record<string, string>)[config.idAttribute ?? '_id'] = idAttribute;
  }

  while (subDoc) {
    idAttribute = subDoc.idParam
      ? getPathParamValue(req, subDoc.idParam)
      : getPathParamValue(req, 'idAttribute');

    if (idAttribute) {
      subDoc.conditions = {};
      if (subDoc.idAttribute) {
        subDoc.conditions[subDoc.idAttribute] = idAttribute;
      }
    }

    subDoc = subDoc.subDoc;
  }

  if (select) {
    fields = select.split(',').join(' ');
  }

  let data = req.body as QueryPayload;
  if (config.bodyFilter && data && !Array.isArray(data)) {
    const sourceData = data as QueryRecord;
    const filteredData: QueryRecord = {};
    for (const key of config.bodyFilter) {
      const fieldValue = sourceData[key];
      if (fieldValue !== undefined) {
        filteredData[key] = fieldValue;
      }
    }
    data = filteredData;
  }

  return {
    conditions,
    subDoc: subDocRoot,
    fields,
    options,
    data,
    callback: createCallback(req, res, config.updateRef),
  };
}
