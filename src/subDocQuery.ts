/*
 * subDocQuery.ts
 * provides the following subDoc utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */
import _ from 'underscore'

type Callback = (err?: any, data?: any, parent?: any) => void

type SubDocConfig = {
  path: string
  idAttribute?: string
  idParam?: string
  conditions?: any
  subDoc?: SubDocConfig
}

type QueryConfig = {
  conditions?: any
  fields?: any
  options?: any
  data?: any
  callback?: Callback
  subDoc?: SubDocConfig
}

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
class SubDocQuery {
  model: any

  constructor (model: any) {
    this.model = model
  }

  // finds the parent doc and perform the
  findSubDoc (config: QueryConfig, cb: Callback) {
    this.model.findOne(config.conditions, config.fields, config.options, (err: any, doc: any) => {
      if (doc) {
        const parent = doc
        let subDoc = config.subDoc
        while (subDoc) {
          doc = doc[subDoc.path]
          if (subDoc.conditions) {
            doc = _.findWhere(doc, subDoc.conditions)
          }
          subDoc = subDoc.subDoc
        }
        cb(err, doc, parent)
      } else {
        cb(err)
      }
    })
  }

  // find all available records
  find (config: QueryConfig, cb?: Callback) {
    cb = config.callback || cb
    this.findSubDoc(config, cb as Callback)
  }

  // find one specific record
  findOne (config: QueryConfig, cb?: Callback) {
    cb = config.callback || cb
    this.findSubDoc(config, cb as Callback)
  }

  // creates the one specific record
  create (config: QueryConfig, data?: any, cb?: Callback) {
    const callback = (err: any, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
      } else {
        data = config.data || data
        cb = config.callback || cb
        // push the new doc
        children.push(data)
        parent.save((err: any, doc: any) => {
          if (doc) {
            if (cb) cb(err, _.last(children))
          } else {
            if (cb) cb(err)
          }
        })
      }
    }
    this.findSubDoc(config, callback)
  }

  // updates the one specific record
  findOneAndUpdate (config: QueryConfig, data?: any, cb?: Callback) {
    const callback = (err: any, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
      } else {
        data = config.data || data
        cb = config.callback || cb
        // push the new doc
        children = Object.assign(children, data)
        parent.save((err: any, doc: any) => {
          if (doc) {
            if (cb) cb(err, children)
          } else {
            if (cb) cb(err)
          }
        })
      }
    }
    this.findSubDoc(config, callback)
  }

  // removes the one specific record
  findOneAndRemove (config: QueryConfig, cb?: Callback) {
    const callback = (err: any, children: any, parent: any) => {
      if (err) {
        if (cb) cb(err)
        return
      }
      cb = config.callback || cb
      // remove selected doc
      children.remove()
      parent.save(function (err: any) {
        if (err) {
          if (cb) cb(err)
        } else {
          if (cb) cb(null)
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
