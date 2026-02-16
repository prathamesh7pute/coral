import type { HydratedDocument, Model } from 'mongoose'
import type {
  QueryCallback,
  QueryConfig
} from './models/query.js'
import type { SubDocCallback, SubDocConfig } from './models/subDoc.js'

type SubDocQueryConfig<TResult = unknown> = QueryConfig<unknown, TResult> & {
  subDoc?: SubDocConfig
}

type FindResult = unknown
type FindOneResult = unknown
type CreateResult = unknown
type UpdateResult = unknown
type RemoveResult = null

function matchesConditions(
  candidate: Record<string, unknown>,
  conditions: Record<string, unknown>
) {
  return Object.keys(conditions).every((key) => candidate[key] === conditions[key])
}

function hasRemoveMethod(node: unknown): node is { remove: () => void } {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'remove' in node &&
      typeof (node as { remove: unknown }).remove === 'function'
  )
}

function hasDeleteOneMethod(node: unknown): node is { deleteOne: () => void } {
  return Boolean(
    node &&
      typeof node === 'object' &&
      'deleteOne' in node &&
      typeof (node as { deleteOne: unknown }).deleteOne === 'function'
  )
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
 * provides sub-document query utility functions:
 * find / findOne / create / findOneAndUpdate / findOneAndRemove
 */
class SubDocQuery<TSchema = unknown> {
  private readonly model: Model<TSchema>

  constructor(model: Model<TSchema>) {
    this.model = model
  }

  private async findSubDoc(config: SubDocQueryConfig): Promise<{
    parent: HydratedDocument<TSchema>
    child: unknown
  } | null> {
    const parent = await this.model.findOne(
      config.conditions,
      config.fields,
      config.options
    ).exec()

    if (!parent) {
      return null
    }

    let child: unknown = parent
    let subDoc = config.subDoc

    while (subDoc && child != null) {
      if (typeof child !== 'object') {
        child = undefined
        break
      }

      const current = child as Record<string, unknown>
      child = current[subDoc.path]

      if (subDoc.conditions && Array.isArray(child)) {
        child = child.find((entry) => {
          return (
            typeof entry === 'object' &&
            entry !== null &&
            matchesConditions(entry as Record<string, unknown>, subDoc.conditions as Record<string, unknown>)
          )
        })
      }

      subDoc = subDoc.subDoc
    }

    return { parent, child }
  }

  find(config: SubDocQueryConfig<FindResult>, cb?: SubDocCallback<FindResult>): Promise<FindResult | void> {
    const callback = config.callback ?? cb
    return withCallback(callback, async () => {
      const result = await this.findSubDoc(config)
      return result ? result.child : undefined
    })
  }

  findOne(
    config: SubDocQueryConfig<FindOneResult>,
    cb?: SubDocCallback<FindOneResult>
  ): Promise<FindOneResult | void> {
    const callback = config.callback ?? cb
    return withCallback(callback, async () => {
      const result = await this.findSubDoc(config)
      return result ? result.child : undefined
    })
  }

  create(
    config: SubDocQueryConfig<CreateResult>,
    data?: unknown,
    cb?: SubDocCallback<CreateResult>
  ): Promise<CreateResult | void> {
    const callback = config.callback ?? cb
    const docData = config.data ?? data

    return withCallback(callback, async () => {
      const result = await this.findSubDoc(config)
      if (!result || !Array.isArray(result.child)) {
        return undefined
      }

      result.child.push(docData)
      await result.parent.save()
      return result.child[result.child.length - 1]
    })
  }

  findOneAndUpdate(
    config: SubDocQueryConfig<UpdateResult>,
    data?: unknown,
    cb?: SubDocCallback<UpdateResult>
  ): Promise<UpdateResult | void> {
    const callback = config.callback ?? cb
    const docData = config.data ?? data

    return withCallback(callback, async () => {
      const result = await this.findSubDoc(config)
      if (!result || !result.child || typeof result.child !== 'object') {
        return undefined
      }

      if (docData && typeof docData === 'object') {
        Object.assign(result.child as Record<string, unknown>, docData)
      }

      await result.parent.save()
      return result.child
    })
  }

  findOneAndRemove(
    config: SubDocQueryConfig<RemoveResult>,
    cb?: SubDocCallback<RemoveResult>
  ): Promise<RemoveResult | void> {
    const callback = config.callback ?? cb

    return withCallback(callback, async () => {
      const result = await this.findSubDoc(config)
      if (!result || !result.child) {
        return null
      }

      if (hasRemoveMethod(result.child)) {
        result.child.remove()
      } else if (hasDeleteOneMethod(result.child)) {
        result.child.deleteOne()
      }

      await result.parent.save()
      return null
    })
  }
}

export default SubDocQuery
