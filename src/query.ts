import type { HydratedDocument, Model } from 'mongoose'
import type {
  QueryCallback,
  QueryConfig
} from './models/query.js'

type FindConfig<TSchema> = QueryConfig<unknown, Array<HydratedDocument<TSchema>>>
type FindOneConfig<TSchema> = QueryConfig<unknown, HydratedDocument<TSchema> | null>
type CreateConfig<TSchema> = QueryConfig<
  unknown,
  HydratedDocument<TSchema> | Array<HydratedDocument<TSchema>> | undefined
>

function getCallback<TResult>(
  config: QueryConfig<unknown, TResult>,
  cb?: QueryCallback<TResult>
) {
  return config.callback ?? cb
}

async function withCallback<TResult>(
  callback: QueryCallback<TResult> | undefined,
  operation: () => Promise<TResult>
): Promise<TResult | void> {
  try {
    const result = await operation()
    if (callback) {
      callback(null, result)
      return
    }
    return result
  } catch (err) {
    if (callback) {
      callback(err)
      return
    }
    throw err
  }
}

/*
 * provides the following database utility functions:
 * find / findOne / create / findOneAndUpdate / findOneAndRemove
 */
class Query<TSchema = unknown> {
  private readonly model: Model<TSchema>

  constructor(model: Model<TSchema>) {
    this.model = model
  }

  find(
    config: FindConfig<TSchema>,
    cb?: QueryCallback<Array<HydratedDocument<TSchema>>>
  ): Promise<Array<HydratedDocument<TSchema>> | void> {
    const callback = getCallback(config, cb)
    return withCallback(callback, async () => {
      return this.model.find(config.conditions, config.fields, config.options).exec()
    })
  }

  findOne(
    config: FindOneConfig<TSchema>,
    cb?: QueryCallback<HydratedDocument<TSchema> | null>
  ): Promise<HydratedDocument<TSchema> | null | void> {
    const callback = getCallback(config, cb)
    return withCallback(callback, async () => {
      return this.model.findOne(config.conditions, config.fields, config.options).exec()
    })
  }

  create(
    config: CreateConfig<TSchema>,
    data?: unknown,
    cb?: QueryCallback<HydratedDocument<TSchema> | Array<HydratedDocument<TSchema>> | undefined>
  ): Promise<HydratedDocument<TSchema> | Array<HydratedDocument<TSchema>> | undefined | void> {
    const callback = config.callback ?? cb
    const docData = config.data ?? data
    if (Array.isArray(docData) && docData.length === 0) {
      if (callback) {
        callback(null, undefined)
        return Promise.resolve()
      }
      return Promise.resolve(undefined)
    }

    return withCallback(callback, async () => {
      const created = await this.model.create(
        docData as Partial<TSchema> | Array<Partial<TSchema>>
      )
      return created as HydratedDocument<TSchema> | Array<HydratedDocument<TSchema>>
    })
  }

  findOneAndUpdate(
    config: QueryConfig<unknown, HydratedDocument<TSchema> | null>,
    data?: unknown,
    cb?: QueryCallback<HydratedDocument<TSchema> | null>
  ): Promise<HydratedDocument<TSchema> | null | void> {
    const callback = config.callback ?? cb
    const docData = config.data ?? data

    return withCallback(callback, async () => {
      const doc = await this.model.findOne(
        config.conditions,
        config.fields,
        config.options
      ).exec()
      if (!doc) {
        return null
      }

      if (docData && typeof docData === 'object') {
        Object.assign(doc, docData)
      }

      await doc.save()
      return doc
    })
  }

  findOneAndRemove(
    config: QueryConfig<unknown, HydratedDocument<TSchema> | null>,
    cb?: QueryCallback<HydratedDocument<TSchema> | null>
  ): Promise<HydratedDocument<TSchema> | null | void> {
    const callback = getCallback(config, cb)
    return withCallback(callback, async () => {
      const doc = await this.model.findOne(
        config.conditions,
        config.fields,
        config.options
      ).exec()
      if (!doc) {
        return null
      }

      await doc.deleteOne()
      return doc
    })
  }
}

export default Query
