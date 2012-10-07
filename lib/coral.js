var createApp = function(site) {
         var express = require('express'),
            _ = require('underscore'),
            mongoose = require('mongoose');

        var configureApp = function(app) {
                return function() {
                    app.set('views', site.root + '/views');
                    app.set('view engine', 'jade');
                    app.use(express["static"].apply(null, [site.root + '/public']));
                    app.use(express.bodyParser());
                    app.use(app.router);
                    app.use(express.errorHandler({
                        dumpExceptions: true,
                        showStack: true
                    }));
                };
            };

        var createRoutes = function(coral, app) {

                var Model = createModel(coral);

                app.get('/' + coral.name, function(req, res) {
                    Model.find({}, function(err, model) {
                        if(err) {
                            return next(err);
                        }
                        res.render('index', { model: "Hello World" });
                    });
                });

                app.post('/' + coral.name, function(req, res) {
                    var model = new Model();
                    model.save(function(err) {
                        if(err) {
                            return next(err);
                        }
                        return res.send(model);
                    });
                });
            };

        var createModel = function(coral) {
                var properties = _.extend({
                    _id: mongoose.Schema.ObjectId
                }, coral.model);
                var schema = new mongoose.Schema(properties);
                return mongoose.model(coral.name, schema);
            };

        var initApp = function() {
                var app = express();
                app.configure(configureApp(app));
                mongoose.connect('mongodb://localhost/coral');
                _.each(site.corals, function(coral, key) {
                    createRoutes(coral, app);
                });

                app.listen(80);
                console.log("Listning app on port 80");
                return app;
            };

        return {
            application: initApp()
        };

    };

exports = module.exports = createApp;

exports.version = '0.0.3';