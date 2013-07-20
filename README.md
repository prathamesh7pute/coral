Coral
=====

[![Build Status](https://secure.travis-ci.org/prathamesh7pute/coral.png?branch=master)](http://travis-ci.org/prathamesh7pute/coral)

Node JS framework to dynamically create REST application with express and mongoose Models

### Creating Routes

To create routes with mongoose Models initialize the coral with the express application

	var app = express();
	var coral = new Coral(app);

Use the route method by passing path and mongoose models as configuration

	coral.route({
		path: '/product',
		model:	Product
	});

Above coral route method will generate the following urls

	/product							-	get
	/produc/:id							-	get
	/product?skip=10&limit=10	  		-	get (limited records)
	/product?sort=name&order=asc&page=1	-	get	(pagination with sorting)
	/product							-	post
	/product/:id						-	put
	/product/:id						-	delete

Following get parameters are supported to get sorted data and pagination

	skip, limit, order, sort and page

If your records are huge and don't want to expose all the records findAll can be set to false so that only limited records will be returned depending on passed options in the skip, limit or page by default per page 20 records are returned this can be change through perPage option 

	coral.route({
		path: '/product',
		model:	Product,
		findAll: false,
		perPage: 10
	});
