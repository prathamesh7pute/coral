import type {
  CoralAdapter,
  CoralAdapterContext,
  CoralCapability,
  CoralListQuery,
  CoralMutationPayload,
} from '@coral/core';

export interface PrismaAdapterOptions {
  modelName: string;
}

function notImplemented<T>(): Promise<T> {
  return Promise.reject(new Error('Not implemented'));
}

export function createPrismaAdapter(_options: PrismaAdapterOptions): CoralAdapter {
  return {
    name: '@coral/adapter-prisma',
    version: '0.0.0-v2-dev',
    capabilities: new Set<CoralCapability>([
      'filtering',
      'pagination',
      'relations',
      'select',
      'sorting',
      'transactions',
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
