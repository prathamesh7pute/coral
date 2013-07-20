var Query = require('../lib/query'),
  util = require('../lib/util');

var callback = function(res) {
  return function(err, data) {
    if (!err) {
      return res.json(data);
    } else {
      return console.log(err);
    }
  };
};


var Routes = function(app) {

  var find = function(path, model, options) {
    app.get(path, function(req, res) {
      var query = new Query(model);
      options = util.processRoute(req, options);
      query.find(options, callback(res));
    });
  };

  var findById = function(path, model) {
    app.get(path, function(req, res) {
      var query = new Query(model),
        params = util.getParams(path);
      query.findById(req.params[params[0]], callback(res));
    });
  };

  var create = function(path, model) {
    app.post(path, function(req, res) {
      var query = new Query(model);
      query.create(req.body, callback(res));
    });
  };

  var update = function(path, model) {
    app.put(path, function(req, res) {
      var query = new Query(model),
        params = util.getParams(path);
      query.findByIdAndUpdate(req.params[params[0]], req.body, callback(res));
    });
  };

  var remove = function(path, model) {
    app.del(path, function(req, res) {
      var query = new Query(model),
        params = util.getParams(path);
      query.findByIdAndRemove(req.params[params[0]], callback(res));
    });
  };

  return {
    find: find,
    findById: findById,
    update: update,
    create: create,
    remove: remove
  };
};

module.exports = Routes;