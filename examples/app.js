var Coral = require('../lib/coral'),
	application;

application = {
	root: __dirname,
	corals: [{
		url: "/",
		model: {
			message: "Hello World"
		}
	}]
};

var app = new Coral(application);