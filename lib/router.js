var Query = require('../lib/query'),
  util = require('../lib/util'),
  async = require('async'),
  _ = require('underscore');

/*
 * Exports the Router Object with utility functions
 */
module.exports = Router;

var parentDoc = function(model, idAttribute, urlParam) {
  return function(cb) {
    var identifier = {};
    var query = new Query(model);
    identifier[idAttribute || '_id'] = urlParam;
    query.findOne(identifier, function(err, doc) {
      cb(err, [doc]);
    });
  };
};

var nestedSubDoc = function(path, urlParam) {
  return function(docs, cb) {
    var doc = _.last(docs);
    docs.push(doc[path].id(urlParam));
    cb(null, docs);
  };
};


/*
 * Router function
 */
function Router(app) {

  var get = function(config) {

    var query = new Query(config.model);

    app.get(config.path, function(req, res) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.find(queryConfig, util.callback(res));
    });

    //find specific route
    app.get(config.path + '/:idAttribute', function(req, res) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOne(queryConfig, util.callback(res));
    });

  };


  // post will create new doc in the model
  var post = function(config) {

    var query = new Query(config.model);

    app.post(config.path, function(req, res) {
      query.create(req.body, util.callback(res));
    });

  };


  var put = function(config) {

    var query = new Query(config.model);

    app.put(config.path + '/:idAttribute', function(req, res) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOneAndUpdate(queryConfig, req.body, util.callback(res));
    });

  };

  var del = function(config) {

    var query = new Query(config.model);

    app.del(config.path + '/:idAttribute', function(req, res) {
      var queryConfig = util.buildQueryConfig(req, config);
      query.findOneAndRemove(queryConfig, util.callback(res));
    });

  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };

}