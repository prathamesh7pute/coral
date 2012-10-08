var createApp = function(site) {
        var express = require('express'),
            _ = require('underscore');

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

                app.get(coral.url, function(req, res) {
                    res.render('index', {
                        model: coral.model
                    });
                });

            };


        var initApp = function() {
                var app = express();
                app.configure(configureApp(app));

                _.each(site.corals, function(coral, key) {
                    createRoutes(coral, app);
                });

                app.listen(site.port);
                console.log("Listning app on port "+site.port);
                return app;
            };

        return {
            application: initApp()
        };

    };

exports = module.exports = createApp;

exports.version = '0.0.4';