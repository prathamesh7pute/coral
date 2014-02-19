var _ = require('underscore');

//returns the process object with the passed data for pagination and sorting
var getOptions = function(req, config) {

	var identifier = {},
		idAttribute = config.idAttribute || '_id';

	//req query
	var sort = req.query.sort,
		order = req.query.order,
		filter = req.query.filter,
		select = req.query.select,
		page = req.query.page,
		perPage = config.perPage || 20,
		skip = req.query.skip,
		limit = req.query.limit;

	//req params
	identifier[idAttribute] = req.params.idAttribute;

	if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
		sort = '-' + sort;
	}

	if (page) {
		skip = page * perPage;
		limit = perPage;
	}

	return {
		sort: sort,
		skip: skip,
		limit: limit,
		filter: filter,
		select: select ? select.replace(/,/g, ' ') : '',
		findAll: config.findAll === false ? false : true,
		identifier: identifier
	};

};


module.exports = {
	getOptions: getOptions
};