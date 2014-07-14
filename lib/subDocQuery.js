/*
 * subDocQuery.js
 * provides the following subDoc utilities functions
 * find    - find all the records, filters them if filter options are provided
 * findOne - find one specific record
 * create  - creates the new record
 * findOneAndUpdate -  update the one specific record
 * findOneAndRemove -  delete the one specific record
 */
var _ = require('underscore');

/*
 * Exports the Query Object with utility functions
 */
module.exports = SubDocQuery;

/*
 * @params Model - mongoose model
 * returns the utility methods
 */
function SubDocQuery(Model) {

    //finds the parent doc and perform the
    var findSubDoc = function(config, cb) {
        Model.findOne(config.conditions, config.fields, config.options, function(err, doc) {
            var parent = doc;
            var lastPath;

            if (doc) {
                while (config.subDoc) {
                    doc = doc[config.subDoc.path];
                    if (config.subDoc.conditions) {
                        doc = _.findWhere(doc, config.subDoc.conditions);
                    }
                    lastPath = config.subDoc.path;
                    config.subDoc = config.subDoc.subDoc;
                }

                cb(err, doc, parent);

            } else {
                cb(err);
            }
        });
    };
    //find all available records
    var find = function(config, cb) {
        cb = config.callback || cb;
        findSubDoc(config, cb);
    };

    //find one specific record
    var findOne = function(config, cb) {
        cb = config.callback || cb;
        findSubDoc(config, cb);
    };

    //creates the one specific record
    var create = function(config, data, cb) {
        var callback = function(err, children, parent) {
            cb = config.callback || cb;
            //push the new doc
            children.push(data);
            parent.save(function(err, doc) {
                if (doc) {
                    cb(err, _.last(children));
                } else {
                    cb(err);
                }
            });
        };
        findSubDoc(config, callback);
    };

    //updates the one specific record
    var findOneAndUpdate = function(config, data, cb) {
        var callback = function(err, children, parent) {
            cb = config.callback || cb;
            //push the new doc
            children = _.extend(children, data);
            parent.save(function(err, doc) {
                if (doc) {
                    cb(err, children);
                } else {
                    cb(err);
                }
            });
        };
        findSubDoc(config, callback);
    };

    //removes the one specific record
    var findOneAndRemove = function(config, cb) {
        var callback = function(err, children, parent) {
            cb = config.callback || cb;
            //push the new doc
            children.remove();
            parent.save(function(err, doc) {
                if (doc) {
                    cb(err);
                } else {
                    cb(err);
                }
            });
        };
        findSubDoc(config, callback);
    };

    return {
        find: find,
        findOne: findOne,
        create: create,
        findOneAndUpdate: findOneAndUpdate,
        findOneAndRemove: findOneAndRemove
    };
}