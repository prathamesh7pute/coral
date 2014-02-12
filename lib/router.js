var Query = require('../lib/query'),
  util = require('../lib/util'),
  _ = require('underscore'),
  async = require('async');

module.exports = Router;

// callback function to pass for routes response
// TODO add socket io and templates support
// TODO err should be descriptive with error code for backbone, angular etc
// TODO allow custom error functions
var callback = function(res) {
  return function(err, data) {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  };
};

function Router(app) {

  var get = function(config) {

    var query = new Query(config.model);

    app.get(config.path, function(req, res) {
      var options = util.getOptions(req, config);
      query.find(options, callback(res));
    });

    //find specific route
    app.get(config.path + '/:idAttribute', function(req, res) {
      var options = util.getOptions(req, config);
      query.findOne(options, callback(res));
    });

  };


  // post will create new doc in the model
  var post = function(config) {

    var query = new Query(config.model);

    app.post(config.path, function(req, res) {
      query.create(req.body, callback(res));
    });

  };


  var put = function(config) {

    var query = new Query(config.model);

    app.put(config.path + '/:idAttribute', function(req, res) {
      var options = util.getOptions(req, config);
      query.findOneAndUpdate(options.identifier, req.body, callback(res));
    });

  };

  var del = function(config) {

    var query = new Query(config.model);

    app.del(config.path + '/:idAttribute', function(req, res) {
      var options = util.getOptions(req, config);
      query.findOneAndRemove(options.identifier, callback(res));
    });

  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };

}