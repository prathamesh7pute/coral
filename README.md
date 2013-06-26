Coral
=====

[![Build Status](https://secure.travis-ci.org/a-1/coral.png?branch=master)](http://travis-ci.org/a-1/coral)

Node JS framework to dynamically create REST apps


coral.route({
  path: "/product",
	models: [Product],
});

/product				-	get
/product/:id				-	get
/product?skip=10&limit=10  		-	get	
/product?sort=name&order=asc&page=1	-	get	pagination - with sorting
/product				-	post
/product/:id				-	put
/product/:id				-	delete

coral.route({
	path: "/product",
	models: [Product],
	methods: ['get', 'post', 'put'],
	findAll: false,
	pagination: false
});

/product/:id				-	get
/product				-	post
/product/:id				-	put

findAll: false - all records will not be return
pagination: false -  skip, limit, sort, order, page params will be ignored
methods: only the routes specified will get created for e.g. here only Get, Post and Put are created - useful when dont want to expose the delete functionality

coral.route({
	path: "/brand",
	mappings:{ 'id' : 'name' },
	models: [Brand],
	middlewares: [isAuthenticated],
	perPage: 10
});

mappings will replace the findById functionality to the findOne with the specified field in the Schema - useful when you have to make SEO friendy links 
perPage; By default Coral will return 20 records per page in case of pagination
middlewares - useful for the autheticatd sites

coral.route({
	path: "/brand/:bid/product",
	models: [Brand, Product],
});

/brand/:bid/product				-	get
/brand/:bid/product/:id				-	get
/brand/:bid/product?skip=10&limit=10  		-	get
/brand/:bid/product?sort=name&order=asc&page=1	-	get	pagination - with sorting
/brand/:bid/product				-	post
/brand/:bid/product/:id				-	put
/brand/:bid/product/:id				-	delete

sub documents - if Schema has sub documents then this will find, update and delete the respective documents
this work in the order in which you provide the models and can be work for n level sub docs
pagination, findAll, mappings, middlewares will work same as docs for sub-docs

async - waterfall

lets make query little bit smart to balance the load between the router, coral and query
query will take decision depending on the parameters we pass to it
