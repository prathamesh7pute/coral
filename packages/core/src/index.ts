export type CoralCapability =
  | 'bulkWrite'
  | 'filtering'
  | 'pagination'
  | 'relations'
  | 'select'
  | 'sorting'
  | 'subDoc'
  | 'transactions';

export interface CoralListQuery {
  filter?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  select?: string[];
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

export interface CoralMutationPayload {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface CoralAdapterContext {
  requestId?: string;
}

export interface CoralAdapter {
  readonly name: string;
  readonly version: string;
  readonly capabilities: ReadonlySet<CoralCapability>;

  list(query: CoralListQuery, context?: CoralAdapterContext): Promise<unknown[]>;
  getById(id: string, context?: CoralAdapterContext): Promise<unknown | null>;
  create(payload: CoralMutationPayload, context?: CoralAdapterContext): Promise<unknown>;
  updateById(
    id: string,
    payload: CoralMutationPayload,
    context?: CoralAdapterContext,
  ): Promise<unknown | null>;
  deleteById(id: string, context?: CoralAdapterContext): Promise<boolean>;
}
