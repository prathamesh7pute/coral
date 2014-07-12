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
            if (doc) {
                while (config.subDoc && config.subDoc.subDoc) {
                    doc = doc[config.subDoc.path];
                    doc = _.findWhere(doc, config.subDoc.conditions);
                    config.subDoc = config.subDoc.subDoc;
                }
                doc = doc[config.subDoc.path];
                cb(err, doc);
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

    };

    //creates the one specific record
    var create = function(data, cb) {

    };

    //updates the one specific record
    var findOneAndUpdate = function(config, data, cb) {

    };

    //removes the one specific record
    var findOneAndRemove = function(config, cb) {

    };

    return {
        find: find,
        findOne: findOne,
        create: create,
        findOneAndUpdate: findOneAndUpdate,
        findOneAndRemove: findOneAndRemove
    };
}