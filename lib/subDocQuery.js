/*
 * subDocQuery.js
 * provides the following subDoc utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */
const _ = require('underscore')

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
class SubDocQuery {
  constructor (model) {
    this.model = model
  }

  // finds the parent doc and perform the
  findSubDoc (config, cb) {
    this.model.findOne(config.conditions, config.fields, config.options, (err, doc) => {
      if (doc) {
        const parent = doc
        while (config.subDoc) {
          doc = doc[config.subDoc.path]
          if (config.subDoc.conditions) {
            doc = _.findWhere(doc, config.subDoc.conditions)
          }
          config.subDoc = config.subDoc.subDoc
        }
        cb(err, doc, parent)
      } else {
        cb(err)
      }
    })
  }

  // find all available records
  find (config, cb) {
    cb = config.callback || cb
    this.findSubDoc(config, cb)
  }

  // find one specific record
  findOne (config, cb) {
    cb = config.callback || cb
    this.findSubDoc(config, cb)
  }

  // creates the one specific record
  create (config, data, cb) {
    const callback = (err, children, parent) => {
      if (err) {
        cb(err)
      } else {
        data = config.data || data
        cb = config.callback || cb
        // push the new doc
        children.push(data)
        parent.save((err, doc) => {
          if (doc) {
            cb(err, _.last(children))
          } else {
            cb(err)
          }
        })
      }
    }
    this.findSubDoc(config, callback)
  }

  // updates the one specific record
  findOneAndUpdate (config, data, cb) {
    const callback = (err, children, parent) => {
      if (err) {
        cb(err)
      } else {
        data = config.data || data
        cb = config.callback || cb
        // push the new doc
        children = Object.assign(children, data)
        parent.save((err, doc) => {
          if (doc) {
            cb(err, children)
          } else {
            cb(err)
          }
        })
      }
    }
    this.findSubDoc(config, callback)
  }

  // removes the one specific record
  findOneAndRemove (config, cb) {
    const callback = (err, children, parent) => {
      if (err) {
        cb(err)
      }
      cb = config.callback || cb
      // remove selected doc
      children.remove()
      parent.save(function (err, doc) {
        if (err) {
          cb(err)
        } else {
          cb(null)
        }
      })
    }
    this.findSubDoc(config, callback)
  }
}

/*
 * Exports the Query Object with utility functions
 */
module.exports = SubDocQuery
