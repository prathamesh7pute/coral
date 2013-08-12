var Query = require('../lib/query'),
  util = require('../lib/util'),
  _ = require('underscore'),
  async = require('async');

var callback = function(res) {
  return function(err, data) {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  };
};

var parentDoc = function(model, idAttribute, urlParam) {
  return function(cb) {
    var identifier = {};
    var query = new Query(model);
    identifier[idAttribute || '_id'] = urlParam; //req.params[urlParam];
    query.findOne(identifier, cb);
  };
};

var nestedSubDoc = function(path, urlParam) {
  return function(doc, cb) {
    cb(null, doc[path].id(urlParam));
  };
};


var Router = function(app) {

  var find = function(config) {
    app.get(config.path, function(req, res) {
      var query = new Query(config.model);
      var options = util.processRoute(req, config);
      query.find(options, callback(res));
    });
  };

  var create = function(config) {
    app.post(config.path, function(req, res) {
      if (config.subDoc) {
        var subDoc = config.subDoc;
        var fns = [];

        fns.push(parentDoc(config.model, config.idAttribute, req.params[config.idParam]));

        while (subDoc.subDoc) {
          fns.push(nestedSubDoc(subDoc.path, req.params[subDoc.idParam]));
          subDoc = subDoc.subDoc;
        }

        async.waterfall(fns, function(err, doc) {
          doc[subDoc.path].push(req.body);
          doc.save(function(err) {
            if (err) {
              return res.json(err);
            }
            return res.json(_.last(doc[subDoc.path]));
          });
        });

      } else {
        var query = new Query(config.model);
        query.create(req.body, callback(res));
      }

    });
  };

  var findOne = function(config) {
    app.get(config.path + '/:idAttribute', function(req, res) {

      if (config.subDoc) {
        var subDoc = config.subDoc;
        var fns = [];

        fns.push(parentDoc(config.model, config.idAttribute, req.params[config.idParam]));

        while (subDoc.subDoc) {
          fns.push(nestedSubDoc(subDoc.path, req.params[subDoc.idParam]));
          subDoc = subDoc.subDoc;
        }

        async.waterfall(fns, function(err, doc) {
          return res.json(doc[subDoc.path].id(req.params.idAttribute));
        });

      } else {
        var query = new Query(config.model),
          identifier = {};
        identifier[config.idAttribute || '_id'] = req.params.idAttribute;
        query.findOne(identifier, callback(res));
      }
    });
  };

  var update = function(config) {
    app.put(config.path + '/:idAttribute', function(req, res) {
      var query = new Query(config.model),
        identifier = {};
      identifier[config.idAttribute || '_id'] = req.params.idAttribute;
      query.findOneAndUpdate(identifier, req.body, callback(res));
    });
  };

  var remove = function(config) {
    app.del(config.path + '/:idAttribute', function(req, res) {
      var query = new Query(config.model),
        identifier = {};
      identifier[config.idAttribute || '_id'] = req.params.idAttribute;
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