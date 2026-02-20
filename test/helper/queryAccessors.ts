import type {
  QueryDocument,
  QueryResult,
  QueryValue,
  SubDocRecord,
  SubDocResult,
} from '../../src/models/index.ts';

export const getQueryDocument = (
  result: QueryResult,
  message = 'Expected one query document',
): QueryDocument => {
  if (!result || Array.isArray(result)) {
    throw new Error(message);
  }

  return result;
};

export const getQueryDocuments = (
  result: QueryResult,
  message = 'Expected query documents array',
): QueryDocument[] => {
  if (!Array.isArray(result)) {
    throw new Error(message);
  }

  return result;
};

export const getSubDocRecord = (
  result: SubDocResult,
  message = 'Expected one sub-document record',
): SubDocRecord => {
  if (!result || Array.isArray(result)) {
    throw new Error(message);
  }

  return result;
};

export const getSubDocRecords = (
  result: SubDocResult,
  message = 'Expected sub-document records array',
): SubDocRecord[] => {
  if (!Array.isArray(result)) {
    throw new Error(message);
  }

  return result;
};

export const getRecordAtIndex = <T>(
  records: ReadonlyArray<T>,
  index: number,
  messagePrefix = 'Expected record at index',
): T => {
  const record = records[index];
  if (!record) {
    throw new Error(`${messagePrefix} ${index}`);
  }

  return record;
};

export const getQueryValueArray = (
  value: QueryValue | undefined,
  message = 'Expected query value array',
): QueryValue[] => {
  if (!Array.isArray(value)) {
    throw new Error(message);
  }

  return value;
};

export const getPopulatedStringField = <TField extends string>(
  value: QueryValue | undefined,
  field: TField,
  entityName: string,
): Record<TField, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected populated ${entityName}`);
  }

  const fieldValue = (value as Record<string, unknown>)[field];
  if (typeof fieldValue !== 'string' || fieldValue.length === 0) {
    throw new Error(`Populated ${entityName} ${field} is missing`);
  }

  return { [field]: fieldValue } as Record<TField, string>;
};
