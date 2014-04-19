var _ = require('underscore');

//returns the process object with the passed data for pagination and sorting
var buildQueryConfig = function(req, config) {

	var sort = req.query.sort,
		order = req.query.order,
		filter = req.query.filter,
		select = req.query.select,
		skip = req.query.skip,
		limit = req.query.limit,
		page = req.query.page,
		perPage = config.perPage || 10,
		idAttribute = req.params.idAttribute,
		query = config.query || {},
		conditions = query.conditions || {},
		options = query.options || {},
		fields = query.fields || '';

	//sort order	
	if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
		options.sort = '-' + sort;
	}

	if (skip) {
		options.skip = skip;
	}

	if (limit) {
		options.limit = limit;
	}

	//pagination
	if (page) {
		options.skip = page * perPage;
		options.limit = perPage;
	}

	//to find unique record for update, remove and findOne
	if (idAttribute) {
		conditions[config.idAttribute || '_id'] = idAttribute;
	}

	if (select) {
		fields = select.replace(/,/g, ' ');
	}

	return {
		conditions: conditions,
		fields: fields,
		options: options
	};

};


// callback function to pass for routes response
// TODO add socket io and templates support
// TODO err should be descriptive with error code for backbone, angular etc
// TODO allow custom error functions
var callback = function(res) {
	return function(err, data) {
		if (err) {
			return res.json(err);
		}
		return res.json(data);
	};
};


module.exports = {
	buildQueryConfig: buildQueryConfig,
	callback: callback
};