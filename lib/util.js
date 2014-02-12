var _ = require('underscore');

//convert to numeric if number else return val 
//TODO simplify this 
var processVal = function(val) {
	if (!isNaN(parseFloat(val)) && isFinite(val)) {
		return +val;
	}
	return val;
};

//process filter options pass from query options
var processFilter = function(filter) {
	var i, token, split,
		filters = filter && filter.split(',') || [],
		len = filters.length,
		data = {};

	for (i = 0; i < len; i++) {
		token = filters[i];

		if ( !! ~token.indexOf('!=')) {
			split = token.split('!=');
			data[split[0]] = {
				$ne: processVal(split[1])
			};
			continue;
		}

		if ( !! ~token.indexOf('<=')) {
			split = token.split('<=');
			data[split[0]] = {
				$lte: processVal(split[1])
			};
			continue;
		}

		if ( !! ~token.indexOf('>=')) {
			split = token.split('>=');
			data[split[0]] = {
				$gte: processVal(split[1])
			};
			continue;
		}

		if ( !! ~token.indexOf('<')) {
			split = token.split('<');
			data[split[0]] = {
				$lt: processVal(split[1])
			};
			continue;
		}

		if ( !! ~token.indexOf('>')) {
			split = token.split('>');
			data[split[0]] = {
				$gt: processVal(split[1])
			};
			continue;
		}

		if ( !! ~token.indexOf('=')) {
			split = token.split('=');
			data[split[0]] = processVal(split[1]);
			continue;
		}

	}
	return data;
};

//returns the process object with the passed data for pagination and sorting
var getOptions = function(req, config) {
	//vatiables
	var identifier = {},
		idAttribute = config.idAttribute || '_id';

	//req query
	var sort = req.query.sort,
		order = req.query.order,
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
		filter: processFilter(req.query.filter),
		select: select ? select.replace(/,/g, ' ') : '',
		findAll: config.findAll === false ? false : true,
		identifier: identifier
	};

};


module.exports = {
	getOptions: getOptions
};