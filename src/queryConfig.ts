
import type { Request, Response } from 'express'

type SubDocConfig = {
  path: string
  idAttribute?: string
  idParam?: string
  conditions?: Record<string, unknown>
  subDoc?: SubDocConfig
}

type UpdateRefConfig = {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findOneId?: ((req: Request, res: Response) => any) | string
}

type QueryConfigType = {
  perPage?: number
  idParam?: string
  idAttribute?: string
  query?: {
    conditions?: Record<string, unknown>
    options?: Record<string, unknown>
    fields?: string
  }
  updateRef?: UpdateRefConfig
  subDoc?: SubDocConfig
}

type QueryConfigResult = {
  conditions: Record<string, unknown>
  subDoc?: SubDocConfig
  fields: string
  options: Record<string, unknown>
  data: unknown
  callback: (err?: unknown, data?: unknown) => void | Response
}

const callback = function (req: Request, res: Response, updateRef?: UpdateRefConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (err: unknown, data: any) {
    if (err) {
      return res.status(400).json(err)
    }

    if (data && updateRef && req.method === 'POST') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let findOneId: any = updateRef.findOneId

      if (typeof updateRef.findOneId === 'function') {
        findOneId = updateRef.findOneId(req, res)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateRef.model.findOne({ _id: findOneId }, function (err: unknown, doc: any) {
        if (err) {
          return res.status(400).json(err)
        }

        if (Array.isArray(doc[updateRef.path])) {
          doc[updateRef.path].push(data._id)
        } else {
          doc[updateRef.path] = data._id
        }

         
        doc.save(function (saveErr: unknown) {
          if (saveErr) {
            return res.status(400).json(saveErr)
          }

          return res.json(data)
        })
      })
    } else {
      return res.json(data)
    }
  }
}

// returns the process object with the passed data for pagination and sorting
export default function QueryConfig(req: Request, res: Response, config: QueryConfigType): QueryConfigResult {
  const sort = req.query.sort as string
  const order = req.query.order as string
  const select = req.query.select as string
  const skip = req.query.skip ? parseInt(req.query.skip as string) : undefined
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
  const page = req.query.page ? parseInt(req.query.page as string) : undefined

  const perPage = config.perPage || 10
  let idAttribute = config.idParam ? req.params[config.idParam] : req.params.idAttribute
  const query = config.query || {}
  const updateRef = config.updateRef
  const conditions = query.conditions || {}
  const options = query.options || {}
  let fields = query.fields || ''
  const subDocRoot = cloneSubDoc(config.subDoc)
  let subDoc = subDocRoot
  const data = req.body

  // sort order
  if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
    options.sort = '-' + sort
  }

  if (sort && (order === 'asc' || order === 'ascending' || order === '1')) {
    options.sort = sort
  }

  if (skip) {
    options.skip = skip
  }

  if (limit) {
    options.limit = limit
  }

  // pagination
  if (page) {
    options.skip = page * perPage
    options.limit = perPage
  }

  // to find unique record for update, remove and findOne
  if (idAttribute) {
    conditions[config.idAttribute || '_id'] = idAttribute
  }

  while (subDoc) {
    idAttribute = subDoc.idParam ? req.params[subDoc.idParam] : req.params.idAttribute
    if (idAttribute) {
      subDoc.conditions = {}
      if (subDoc.idAttribute) {
        subDoc.conditions[subDoc.idAttribute] = idAttribute
      }
    }
    subDoc = subDoc.subDoc
  }

  if (select) {
    fields = select.replace(/,/g, ' ')
  }

  return {
    conditions,
    subDoc: subDocRoot,
    fields,
    options,
    data,
    callback: callback(req, res, updateRef)
  }
}

function cloneSubDoc(subDoc?: SubDocConfig): SubDocConfig | undefined {
  if (!subDoc) return subDoc
  const cloned: SubDocConfig = Object.assign({}, subDoc)
  if (cloned.conditions) {
    cloned.conditions = Object.assign({}, cloned.conditions)
  }
  if (subDoc.subDoc) {
    cloned.subDoc = cloneSubDoc(subDoc.subDoc)
  }
  return cloned
}
