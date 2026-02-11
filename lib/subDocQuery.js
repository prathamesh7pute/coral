/*
 * subDocQuery.ts
 * provides the following subDoc utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */
// import _ from 'underscore'
/*
 * @params Model - mongoose model
 * returns the utility methods
 */
class SubDocQuery {
    model;
    constructor(model) {
        this.model = model;
    }
    // finds the parent doc and perform the
    findSubDoc(config, cb) {
        this.model.findOne(config.conditions, config.fields, config.options, (err, doc) => {
            if (doc) {
                const parent = doc;
                let subDoc = config.subDoc;
                while (subDoc) {
                    doc = doc[subDoc.path];
                    if (subDoc.conditions) {
                        // doc = _.findWhere(doc, subDoc.conditions)
                        doc = doc.find((d) => {
                            return Object.keys(subDoc.conditions).every(key => d[key] === subDoc.conditions[key]);
                        });
                    }
                    subDoc = subDoc.subDoc;
                }
                cb(err, doc, parent);
            }
            else {
                cb(err);
            }
        });
    }
    // find all available records
    find(config, cb) {
        cb = config.callback || cb;
        this.findSubDoc(config, cb);
    }
    // find one specific record
    findOne(config, cb) {
        cb = config.callback || cb;
        this.findSubDoc(config, cb);
    }
    // creates the one specific record
    create(config, data, cb) {
        const callback = (err, children, parent) => {
            if (err) {
                if (cb)
                    cb(err);
            }
            else {
                data = config.data || data;
                cb = config.callback || cb;
                // push the new doc
                children.push(data);
                parent.save((err, doc) => {
                    if (doc) {
                        if (cb)
                            cb(err, children[children.length - 1]);
                    }
                    else {
                        if (cb)
                            cb(err);
                    }
                });
            }
        };
        this.findSubDoc(config, callback);
    }
    // updates the one specific record
    findOneAndUpdate(config, data, cb) {
        const callback = (err, children, parent) => {
            if (err) {
                if (cb)
                    cb(err);
            }
            else {
                data = config.data || data;
                cb = config.callback || cb;
                // push the new doc
                children = Object.assign(children, data);
                parent.save((err, doc) => {
                    if (doc) {
                        if (cb)
                            cb(err, children);
                    }
                    else {
                        if (cb)
                            cb(err);
                    }
                });
            }
        };
        this.findSubDoc(config, callback);
    }
    // removes the one specific record
    findOneAndRemove(config, cb) {
        const callback = (err, children, parent) => {
            if (err) {
                if (cb)
                    cb(err);
                return;
            }
            cb = config.callback || cb;
            // remove selected doc
            children.remove();
            parent.save(function (err) {
                if (err) {
                    if (cb)
                        cb(err);
                }
                else {
                    if (cb)
                        cb(null);
                }
            });
        };
        this.findSubDoc(config, callback);
    }
}
/*
 * Exports the Query Object with utility functions
 */
export default SubDocQuery;
