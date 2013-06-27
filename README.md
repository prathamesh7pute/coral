Coral
=====

[![Build Status](https://secure.travis-ci.org/a-1/coral.png?branch=master)](http://travis-ci.org/a-1/coral)

Node JS framework to dynamically create REST apps

### Creating Routes with mongoose Models

To create routes with mongoose models initialise the coral with the express app, and use the route method by passing path and models configuration

	var coral = new Coral(app);

	coral.route({
		path: "/product",
		models:	[Product],
	});
	
Coral route method will generate the following urls	

	/product							-	get
	/produc/:id							-	get
	/product?skip=10&limit=10	  		-	get	
	/product?sort=name&order=asc&page=1	-	get	pagination - with sorting
	/product							-	post
	/product/:id						-	put
	/product/:id						-	delete
