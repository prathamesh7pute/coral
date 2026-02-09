/*
 * Query.ts
 * provides the following database utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */

type Callback = (err?: any, data?: any) => void

type QueryConfig = {
  conditions?: any
  fields?: any
  options?: any
  data?: any
  callback?: Callback
}

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
class Query {
  model: any

  constructor (model: any) {
    this.model = model
  }

  // find all available records
  find (config: QueryConfig, cb?: Callback) {
    cb = config.callback || cb
    this.model.find(config.conditions, config.fields, config.options, cb)
  }

  // find one specific record
  findOne (config: QueryConfig, cb?: Callback) {
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, cb)
  }

  // creates the one specific record
  create (config: QueryConfig, data?: any, cb?: Callback) {
    data = config.data || data
    cb = config.callback || cb
    if (Array.isArray(data) && data.length === 0) {
      if (cb) cb(null)
      return
    }
    this.model.create(data, cb)
  }

  // updates the one specific record
  findOneAndUpdate (config: QueryConfig, data?: any, cb?: Callback) {
    data = config.data || data
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, (err: any, doc: any) => {
      if (doc) {
        doc = Object.assign(doc, data)
        doc.save(cb)
      } else {
        if (cb) cb(err) // error or no docs
      }
    })
  }

  // removes the one specific record
  findOneAndRemove (config: QueryConfig, cb?: Callback) {
    cb = config.callback || cb
    this.model.findOne(config.conditions, config.fields, config.options, (err: any, doc: any) => {
      if (doc) {
        doc.deleteOne(cb)
      } else {
        if (cb) cb(err) // error or no docs
      }
    })
  }
}

/*
 * Exports the Query Object with utility functions
 */
export default Query
