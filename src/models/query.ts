import type { Document } from 'mongoose'

export type QueryFields = string | Record<string, unknown>
export type QueryConditions = Record<string, unknown>
export type QueryOptions = Record<string, unknown>

export type QueryCallback<TResult> = (err: unknown, data?: TResult) => void

export interface QueryConfig<TData = unknown, TResult = unknown> {
  conditions?: QueryConditions
  fields?: QueryFields
  options?: QueryOptions
  data?: TData
  callback?: QueryCallback<TResult>
}

export type QueryDocument = Document
