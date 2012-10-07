var Coral = require('../lib/coral'),
    application;

application = {
    root: __dirname,
    corals: [{
        name: "",
        model: {}
    }]
};

return new Coral(application);