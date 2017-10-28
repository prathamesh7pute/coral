Coral
=====

[![Build Status](https://secure.travis-ci.org/prathamesh7pute/coral.png?branch=master)](http://travis-ci.org/prathamesh7pute/coral)
[![NPM version](https://badge.fury.io/js/coral.png)](http://badge.fury.io/js/coral)
[![Dependency Status](https://david-dm.org/prathamesh7pute/coral.svg?theme=shields.io)](https://david-dm.org/prathamesh7pute/coral)
[![devDependency Status](https://david-dm.org/prathamesh7pute/coral/dev-status.svg?theme=shields.io)](https://david-dm.org/prathamesh7pute/coral#info=devDependencies)

Node.js framework to create REST API with express and mongoose models

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# NPM
npm install coral --save
```

## Usage

**Creating Routes**

pass path and mongoose models as configuration to Coral to generate routes

```js
var app = express();

//define mongoose schema
var ProductSchema = new Schema({
    name: String
});
//create the mongoose model
var Product = mongoose.model('Product', ProductSchema);

//Coral will return the express router with REST routes 
var productRouter = new Coral({
    path: '/product',
    model:	Product
});

//use the Coral router in express app
app.use(productRouter);
```

Above Coral router will generate the following routes

	/product							-	get
	/product/:id						-	get
	/product							-	post
	/product/:id						-	put
	/product/:id						-	delete

## Configuration


Following get parameters are supported to get sorted data and pagination

	skip, limit, order, sort and page

In the skip, limit or page by default per page 10 records are returned this can be change through perPage option 

	var productRoutes = new Coral({
		path: '/product',
		model:	Product,
		perPage: 50
	});

In some cases routes specific to some methods are needed like only want to provide user read, create and update functionality without delete this can be done by specifying methods option

	var productRoutes = new Coral({
		path: '/product',
		model:	Product,
		methods: ['GET', 'POST', 'PUT']
	});

Above coral route method will only generate the following routes without delete

	/product							-	get
	/product/:id						-	get
	/product?skip=10&limit=10	  		-	get (limited records)
	/product?sort=name&order=asc&page=1	-	get	(pagination with sorting)
	/product							-	post
	/product/:id						-	put

Following options are supported to create specific methods routes

	GET, POST, PUT and DELETE


## API Reference

TODO.

## Contributing

Found a bug or something needs to be refactored, please let me know. Pull requests are always welcome.

## License

The MIT License (MIT)

Copyright (c) 2017 Prathamesh Satpute

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
