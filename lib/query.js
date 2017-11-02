/*
 * Query.js
 * provides the following database utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
class Query {
  constructor (model) {
    this.model = model
  }

  // find all available records
  find (config, cb) {
    cb = config.callback || cb
    this.model.find(config.conditions, config.fields, config.options, cb)
  }

  // find one specific record
  findOne (config, cb) {
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, cb)
  }

  // creates the one specific record
  create (config, data, cb) {
    data = config.data || data
    cb = config.callback || cb
    this.model.create(data, cb)
  }

  // updates the one specific record
  findOneAndUpdate (config, data, cb) {
    data = config.data || data
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, (err, doc) => {
      if (doc) {
        doc = Object.assign(doc, data)
        doc.save(cb)
      } else {
        cb(err) // error or no docs
      }
    })
  }

  // removes the one specific record
  findOneAndRemove (config, cb) {
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, (err, doc) => {
      if (doc) {
        doc.remove(cb)
      } else {
        cb(err) // error or no docs
      }
    })
  }
}

/*
 * Exports the Query Object with utility functions
 */
module.exports = Query
