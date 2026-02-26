import type {
  CoralAdapter,
  CoralAdapterContext,
  CoralCapability,
  CoralListQuery,
  CoralMutationPayload,
} from '@coral/core';

export interface MongooseAdapterOptions {
  modelName: string;
}

function notImplemented<T>(): Promise<T> {
  return Promise.reject(new Error('Not implemented'));
}

export function createMongooseAdapter(_options: MongooseAdapterOptions): CoralAdapter {
  return {
    name: '@coral/adapter-mongoose',
    version: '0.0.0-v2-dev',
    capabilities: new Set<CoralCapability>([
      'filtering',
      'pagination',
      'select',
      'sorting',
      'subDoc',
    ]),
    list(_query: CoralListQuery, _context?: CoralAdapterContext): Promise<unknown[]> {
      return notImplemented<unknown[]>();
    },
    getById(_id: string, _context?: CoralAdapterContext): Promise<unknown | null> {
      return notImplemented<unknown | null>();
    },
    create(_payload: CoralMutationPayload, _context?: CoralAdapterContext): Promise<unknown> {
      return notImplemented<unknown>();
    },
    updateById(
      _id: string,
      _payload: CoralMutationPayload,
      _context?: CoralAdapterContext,
    ): Promise<unknown | null> {
      return notImplemented<unknown | null>();
    },
    deleteById(_id: string, _context?: CoralAdapterContext): Promise<boolean> {
      return notImplemented<boolean>();
    },
  };
}
