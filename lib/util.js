// returns the parameters in the url
var getParams = function(path) {

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

//returns the process object with the passed data for pagination and sorting
var processRoute = function(req, options) {

  var sort, order, page = req.query.page || false;

  sort = req.query.sort || false;
  order = req.query.order;

  if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
    sort = '-' + sort;
  }

  return {
    sort: sort,
    page: page,
    skip: req.query.skip || 0,
    limit: req.query.limit || 20,
    perPage: options.perPage || 20,
    findAll: options.findAll === false ? false : true
  };

};


var util = {
  getParams: getParams,
  processRoute: processRoute
};

module.exports = util;