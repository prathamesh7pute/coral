exports.getParams = function (path) {

	var tokens = path.split('/'),
		len = tokens.length,
		params = [],
		finder = ':',
		i;

	for (i = 0; i < len; i++) {
		if (tokens[i].substring(0, 1) === finder) {
			params.push(tokens[i].substr(1));
		}
	}

	return params;
};
