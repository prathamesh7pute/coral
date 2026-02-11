/*
 * Query.ts
 * provides the following database utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */

import { Model, Document } from 'mongoose'

type QueryCallback = (err?: unknown, data?: unknown) => void

type QueryConfig = {
  conditions?: Record<string, unknown>
  fields?: string | Record<string, unknown>
  options?: Record<string, unknown>
  data?: unknown
  callback?: QueryCallback
}

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Query<T extends Document = any> {
  model: Model<T>

  constructor(model: Model<T>) {
    this.model = model
  }

  // find all available records
  find(config: QueryConfig, cb?: QueryCallback) {
    const callback = config.callback || cb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.find(config.conditions, config.fields, config.options, callback as any)
  }

  // find one specific record
  findOne(config: QueryConfig, cb?: QueryCallback) {
    const callback = config.callback || cb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.findOne(config.conditions, config.fields, config.options, callback as any)
  }

  // creates the one specific record
  create(config: QueryConfig, data?: unknown, cb?: QueryCallback) {
    const docData = config.data || data
    const callback = config.callback || cb
    if (Array.isArray(docData) && docData.length === 0) {
      if (callback) callback(null)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.create(docData as any, callback as any)
  }

  // updates the one specific record
  findOneAndUpdate(config: QueryConfig, data?: unknown, cb?: QueryCallback) {
    const docData = config.data || data
    const callback = config.callback || cb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.findOne(config.conditions, config.fields, config.options, (err: unknown, doc: any) => {
      if (doc) {
        Object.assign(doc, docData)
        doc.save(callback)
      } else {
        if (callback) callback(err) // error or no docs
      }
    })
  }

  // removes the one specific record
  findOneAndRemove(config: QueryConfig, cb?: QueryCallback) {
    const callback = config.callback || cb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.findOne(config.conditions, config.fields, config.options, (err: unknown, doc: any) => {
      if (doc) {
        doc.deleteOne(callback)
      } else {
        if (callback) callback(err) // error or no docs
      }
    })
  }
}

/*
 * Exports the Query Object with utility functions
 */
export default Query
