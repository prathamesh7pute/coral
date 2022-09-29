const _ = require('underscore')
// export QueryConfig
module.exports = QueryConfig

const callback = function (req, res, updateRef) {
  const updateDocReference = function (data) {
    let findOneId = updateRef.findOneId

    if (_.isFunction(updateRef.findOneId)) {
      findOneId = updateRef.findOneId(req, res)
    }

    updateRef.model.findOne({ _id: findOneId }, function (err, doc) {
      if (err) {
        return res.status(400).json(err)
      }

      if (_.isArray(doc[updateRef.path])) {
        doc[updateRef.path].push(data._id)
      } else {
        doc[updateRef.path] = data._id
      }

      doc.save(function (saveErr) {
        if (saveErr) {
          return res.status(400).json(saveErr)
        }

        return res.json(data)
      })
    })
  }

  return function (err, data) {
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
function QueryConfig (req, res, config) {
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
  let subDoc = config.subDoc
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
      subDoc.conditions[subDoc.idAttribute] = idAttribute
    }
    subDoc = subDoc.subDoc
  }

  if (select) {
    fields = select.replace(/,/g, ' ')
  }

  return {
    conditions,
    subDoc: config.subDoc,
    fields,
    options,
    data,
    callback: callback(req, res, updateRef)
  }
}
