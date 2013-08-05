var Query = require('../lib/query'),
  util = require('../lib/util'),
  _ = require('underscore');

var callback = function(res) {
  return function(err, data) {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  };
};

var Router = function(app) {

  var find = function(path, model, options) {
    app.get(path, function(req, res) {
      var query = new Query(model);
      options = util.processRoute(req, options);
      query.find(options, callback(res));
    });
  };

  var create = function(path, model) {
    app.post(path, function(req, res) {
      var query = new Query(model);
      query.create(req.body, callback(res));
    });
  };

  var findOne = function(path, model, idAttribute) {
    app.get(path + '/:idAttribute', function(req, res) {
      var query = new Query(model),
        identifier = {};
      identifier[idAttribute] = req.params.idAttribute;
      query.findOne(identifier, callback(res));
    });
  };

  var update = function(path, model, idAttribute) {
    app.put(path + '/:idAttribute', function(req, res) {
      var query = new Query(model),
        identifier = {};
      identifier[idAttribute] = req.params.idAttribute;
      query.findOneAndUpdate(identifier, req.body, callback(res));
    });
  };

  var remove = function(path, model, idAttribute) {
    app.del(path + '/:idAttribute', function(req, res) {
      var query = new Query(model),
        identifier = {};
      identifier[idAttribute] = req.params.idAttribute;
      query.findOneAndRemove(identifier, callback(res));
    });
  };

  return {
    find: find,
    findOne: findOne,
    create: create,
    update: update,
    remove: remove
  };
};

module.exports = Router;