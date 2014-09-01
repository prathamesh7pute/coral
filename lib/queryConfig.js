
//export QueryConfig
module.exports = QueryConfig;


var callback = function(res) {
	return function(err, data) {
		if (err) {
			return res.json(err);
		}
		return res.json(data);
	};
};

//returns the process object with the passed data for pagination and sorting
function QueryConfig(req, res, config) {

	var sort = req.query.sort,
		order = req.query.order,
		select = req.query.select,
		skip = req.query.skip,
		limit = req.query.limit,
		page = req.query.page,
		perPage = config.perPage || 10,
		idAttribute = config.idParam ? req.params[config.idParam] : req.params.idAttribute,
		query = config.query || {},
		conditions = query.conditions || {},
		options = query.options || {},
		fields = query.fields || '',
		subDoc = config.subDoc,
		data = req.body;

	//sort order
	if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
		options.sort = '-' + sort;
	}

	if (sort && (order === 'asc' || order === 'ascending' || order === '1')) {
		options.sort = sort;
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

	while (subDoc) {
		idAttribute = subDoc.idParam ? req.params[subDoc.idParam] : req.params.idAttribute;
		if (idAttribute) {
			subDoc.conditions = {};
			subDoc.conditions[subDoc.idAttribute] = idAttribute;
		}
		subDoc = subDoc.subDoc;
	}

	if (select) {
		fields = select.replace(/,/g, ' ');
	}

	return {
		conditions: conditions,
		subDoc: config.subDoc,
		fields: fields,
		options: options,
		data: data,
		callback: callback(res)
	};

}