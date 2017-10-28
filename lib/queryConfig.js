var _ = require('underscore')
// export QueryConfig
module.exports = QueryConfig

var callback = function (req, res, updateRef) {
  var updateDocReference = function (data) {
    var findOneId = updateRef.findOneId

    if (_.isFunction(updateRef.findOneId)) {
      findOneId = updateRef.findOneId(req, res)
    }

    updateRef.model.findOne({_id: findOneId}, function (err, doc) {
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
  var sort = req.query.sort
  var order = req.query.order
  var select = req.query.select
  var skip = req.query.skip
  var limit = req.query.limit
  var page = req.query.page
  var perPage = config.perPage || 10
  var idAttribute = config.idParam ? req.params[config.idParam] : req.params.idAttribute
  var query = config.query || {}
  var updateRef = config.updateRef
  var conditions = query.conditions || {}
  var options = query.options || {}
  var fields = query.fields || ''
  var subDoc = config.subDoc
  var data = req.body

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
    conditions: conditions,
    subDoc: config.subDoc,
    fields: fields,
    options: options,
    data: data,
    callback: callback(req, res, updateRef)
  }
}
