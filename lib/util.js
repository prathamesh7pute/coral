// returns the parameters in the url
var getRouteParams = function(path) {

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

var processVal = function(val) {
  if (!isNaN(parseFloat(val)) && isFinite(val)) {
    return +val;
  }
  return val;
};

//http://localhost:3000/brand?filter=name=b,age=[>10,<20]&select=name,age
var processFilters = function(filter) {
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
var processRoute = function(req, options) {

  var sort = req.query.sort || false,
    order = req.query.order;

  if (sort && (order === 'desc' || order === 'descending' || order === '-1')) {
    sort = '-' + sort;
  }

  return {
    sort: sort,
    page: req.query.page || false,
    perPage: options.perPage || 20,
    skip: req.query.skip || false,
    limit: req.query.limit || false,
    filter: processFilters(req.query.filter),
    findAll: options.findAll === false ? false : true
  };

};


var util = {
  getRouteParams: getRouteParams,
  processFilters: processFilters,
  processRoute: processRoute
};

module.exports = util;