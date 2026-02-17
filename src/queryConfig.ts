import type { Request, Response } from 'express'
import type { Document } from 'mongoose'
import type {
  CoralConfig,
  CoralQueryConfig,
  QueryDefaults,
  UpdateRefConfig
} from './models/coral.js'
import type { SubDocConfig } from './models/subDoc.js'

function parseQueryNumber(value: unknown) {
  if (value === undefined || value === null) {
    return undefined
  }

  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function cloneSubDoc(subDoc?: SubDocConfig): SubDocConfig | undefined {
  if (!subDoc) return undefined

  const cloned: SubDocConfig = { ...subDoc }
  if (subDoc.conditions) {
    cloned.conditions = { ...subDoc.conditions }
  }
  if (subDoc.subDoc) {
    cloned.subDoc = cloneSubDoc(subDoc.subDoc)
  }

  return cloned
}

function getQueryDefaults(config: CoralConfig): Required<QueryDefaults> {
  const baseConditions = config.conditions ?? {}
  const baseOptions = config.options ?? {}
  const baseFields = config.fields ?? ''

  return {
    conditions: {
      ...baseConditions,
      ...(config.query?.conditions ?? {})
    },
    options: {
      ...baseOptions,
      ...(config.query?.options ?? {})
    },
    fields: config.query?.fields ?? baseFields
  }
}

function getFindOneId(
  req: Request,
  res: Response,
  updateRef: UpdateRefConfig
) {
  if (typeof updateRef.findOneId === 'function') {
    return updateRef.findOneId(req, res)
  }

  return updateRef.findOneId
}

function createCallback(
  req: Request,
  res: Response,
  updateRef?: UpdateRefConfig
) {
  return async function callback(err: unknown, data?: unknown) {
    if (err) {
      res.status(400).json(err)
      return
    }

    if (!data || !updateRef || req.method !== 'POST') {
      res.json(data)
      return
    }

    try {
      const findOneId = getFindOneId(req, res, updateRef)
      const doc = await updateRef.model.findOne({ _id: findOneId }).exec()

      if (!doc) {
        res.status(404).json({ message: 'Reference document not found' })
        return
      }

      const target = (doc as Document & Record<string, unknown>)[updateRef.path]
      if (Array.isArray(target)) {
        target.push((data as Document & { _id: unknown })._id)
      } else {
        ; (doc as Document & Record<string, unknown>)[updateRef.path] = (
          data as Document & { _id: unknown }
        )._id
      }

      await doc.save()
      res.json(data)
    } catch (saveErr) {
      console.error('Error saving reference document:', saveErr)
      res.status(400).json({ message: 'Failed to update reference document' })
    }
  }
}

/*
 * returns query configuration object used by Query/SubDocQuery
 */
export default function createQueryConfig(
  req: Request,
  res: Response,
  config: CoralConfig
): CoralQueryConfig {
  const sort = req.query.sort ? String(req.query.sort) : undefined
  const order = req.query.order ? String(req.query.order) : undefined
  const select = req.query.select ? String(req.query.select) : undefined
  const skip = parseQueryNumber(req.query.skip)
  const limit = parseQueryNumber(req.query.limit)
  const page = parseQueryNumber(req.query.page)

  const perPage = config.perPage ?? 10
  const defaults = getQueryDefaults(config)
  const conditions = defaults.conditions
  const options = defaults.options
  let fields = defaults.fields

  const subDocRoot = cloneSubDoc(config.subDoc)
  let subDoc = subDocRoot

  let idAttribute = config.idParam
    ? req.params[config.idParam]
    : req.params.idAttribute

  if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
    options.sort = `-${sort}`
  } else if (sort && (order === 'asc' || order === 'ascending' || order === '1')) {
    options.sort = sort
  }

  if (skip) {
    options.skip = skip
  }

  if (limit) {
    const maxLimit = config.perPage ? config.perPage * 10 : 100
    options.limit = Math.min(limit, maxLimit)
  }

  if (page) {
    options.skip = page * perPage
    options.limit = perPage
  }

  if (idAttribute) {
    conditions[config.idAttribute ?? '_id'] = idAttribute
  }

  while (subDoc) {
    idAttribute = subDoc.idParam
      ? req.params[subDoc.idParam]
      : req.params.idAttribute

    if (idAttribute) {
      subDoc.conditions = {}
      if (subDoc.idAttribute) {
        subDoc.conditions[subDoc.idAttribute] = idAttribute
      }
    }

    subDoc = subDoc.subDoc
  }

  if (select) {
    fields = select.split(',').join(' ')
  }

  let data = req.body
  if (config.bodyFilter && data && typeof data === 'object') {
    data = Object.keys(data)
      .filter((key) => config.bodyFilter!.includes(key))
      .reduce((obj, key) => {
        ; (obj as Record<string, unknown>)[key] = (
          data as Record<string, unknown>
        )[key]
        return obj
      }, {})
  }

  return {
    conditions,
    subDoc: subDocRoot,
    fields,
    options,
    data,
    callback: createCallback(req, res, config.updateRef)
  }
}
