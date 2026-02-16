export type SubDocConditions = Record<string, unknown>

export interface SubDocConfig {
  path: string
  idAttribute?: string
  idParam?: string
  conditions?: SubDocConditions
  subDoc?: SubDocConfig
}

export type SubDocCallback<TResult = unknown, TParent = unknown> = (
  err: unknown,
  data?: TResult,
  parent?: TParent
) => void
