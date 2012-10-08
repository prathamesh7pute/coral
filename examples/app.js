var Coral = require('../lib/coral'),
	application;

application = {
	root: __dirname,
	port: process.env.PORT || 80,
	corals: [{
		url: "/",
		model: {
			message: "Hello World"
		}
	}]
};

var app = new Coral(application);