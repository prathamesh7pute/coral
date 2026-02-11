/*
 * subDocQuery.ts
 * provides the following subDoc utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */

import { Model, Document } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (err?: unknown, data?: any, parent?: any) => void

type SubDocConfig = {
  path: string
  idAttribute?: string
  idParam?: string
  conditions?: Record<string, unknown>
  subDoc?: SubDocConfig
}

type QueryConfig = {
  conditions?: Record<string, unknown>
  fields?: string | Record<string, unknown>
  options?: Record<string, unknown>
  data?: unknown
  callback?: Callback
  subDoc?: SubDocConfig
}

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SubDocQuery<T extends Document = any> {
  model: Model<T>

  constructor(model: Model<T>) {
    this.model = model
  }

  // finds the parent doc and perform the
  findSubDoc(config: QueryConfig, cb: Callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model.findOne(config.conditions, config.fields, config.options, (err: unknown, doc: any) => {
      if (doc) {
        const parent = doc
        let subDoc = config.subDoc
        while (subDoc) {
          if (!doc) break
          doc = doc[subDoc.path]
          if (!doc) break
          if (subDoc.conditions && Array.isArray(doc)) {
            const conditions = subDoc.conditions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            doc = doc.find((d: any) => {
              return Object.keys(conditions).every(key => d[key] === conditions[key])
            })
          }
          subDoc = subDoc && subDoc.subDoc
        }
        cb(err, doc, parent)
      } else {
        cb(err)
      }
    })
  }

  // find all available records
  find(config: QueryConfig, cb?: Callback) {
    const callback = config.callback || cb
    if (callback) {
      this.findSubDoc(config, callback)
    }
  }

  // find one specific record
  findOne(config: QueryConfig, cb?: Callback) {
    const callback = config.callback || cb
    if (callback) {
      this.findSubDoc(config, callback)
    }
  }

  // creates the one specific record
  create(config: QueryConfig, data?: unknown, cb?: Callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (err: unknown, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
      } else {
        const docData = config.data || data
        const finalCb = config.callback || cb
        // push the new doc
        if (Array.isArray(children)) {
          children.push(docData)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parent.save((err: unknown, savedDoc: any) => {
            if (savedDoc) {
              if (finalCb) finalCb(err, children[children.length - 1])
            } else {
              if (finalCb) finalCb(err)
            }
          })
        }

      }
    }
    this.findSubDoc(config, callback)
  }

  // updates the one specific record
  findOneAndUpdate(config: QueryConfig, data?: unknown, cb?: Callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (err: unknown, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
      } else {
        const docData = config.data || data
        const finalCb = config.callback || cb
        // push the new doc
        Object.assign(children, docData)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parent.save((err: unknown, savedDoc: any) => {
          if (savedDoc) {
            if (finalCb) finalCb(err, children)
          } else {
            if (finalCb) finalCb(err)
          }
        })
      }
    }
    this.findSubDoc(config, callback)
  }

  // removes the one specific record
  findOneAndRemove(config: QueryConfig, cb?: Callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (err: unknown, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
        return
      }
      const finalCb = config.callback || cb
      // remove selected doc
      if (children && typeof children.remove === 'function') {
        children.remove()
      } else if (parent && Array.isArray(parent)) {
        // Fallback
      } else if (children && typeof children.deleteOne === 'function') {
        children.deleteOne()
      }


      parent.save(function (err: unknown) {
        if (err) {
          if (finalCb) finalCb(err)
        } else {
          if (finalCb) finalCb(null)
        }
      })
    }
    this.findSubDoc(config, callback)
  }
}

/*
 * Exports the Query Object with utility functions
 */
export default SubDocQuery
