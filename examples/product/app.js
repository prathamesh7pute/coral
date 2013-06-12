var Coral = require('../../lib/coral'),
	express = require('express'),
	Brand = require('./models/Brand'),
	Product = require('./models/Product'),
	mongoose = require('mongoose'),
	app = express();


app.configure(function() {
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

//connect to db
mongoose.connect('mongodb://localhost/backbone_mongoose_test');

var coral = new Coral(app);

coral.create({
	methods: ['get', 'post', 'put', 'delete'],
	path: '/brand',
	params: ['bid'],
	models: [Brand],
	findAll: true,
});

coral.create({
	methods: ['get', 'post', 'put', 'delete'],
	path: '/product',
	params: ['pid'],
	models: [Product],
	findAll: true
});

app.listen(3000);
