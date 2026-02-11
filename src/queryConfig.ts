// import _ from 'underscore'
// export QueryConfig
export default QueryConfig

type SubDocConfig = {
  path: string
  idAttribute?: string
  idParam?: string
  conditions?: any
  subDoc?: SubDocConfig
}

type QueryConfigResult = {
  conditions: any
  subDoc?: SubDocConfig
  fields: any
  options: any
  data: any
  callback: (err?: any, data?: any) => void
}

const callback = function (req: any, res: any, updateRef: any) {
  const updateDocReference = function (data: any) {
    let findOneId = updateRef.findOneId

    if (typeof updateRef.findOneId === 'function') {
      findOneId = updateRef.findOneId(req, res)
    }

    updateRef.model.findOne({ _id: findOneId }, function (err: any, doc: any) {
      if (err) {
        return res.status(400).json(err)
      }

      if (Array.isArray(doc[updateRef.path])) {
        doc[updateRef.path].push(data._id)
      } else {
        doc[updateRef.path] = data._id
      }

      doc.save(function (saveErr: any) {
        if (saveErr) {
          return res.status(400).json(saveErr)
        }

        return res.json(data)
      })
    })
  }

  return function (err: any, data: any) {
    if (err) {
      return res.status(400).json(err)
    }

    if (data && updateRef && req.method === 'POST') {
      updateDocReference(data)
    } else {
      return res.json(data)
    }
  }
}

// returns the process object with the passed data for pagination and sorting
function QueryConfig(req: any, res: any, config: any): QueryConfigResult {
  const sort = req.query.sort
  const order = req.query.order
  const select = req.query.select
  const skip = req.query.skip
  const limit = req.query.limit
  const page = req.query.page
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
      subDoc.conditions[subDoc.idAttribute as string] = idAttribute
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
  cloned.subDoc = cloneSubDoc(subDoc.subDoc)
  return cloned
}
