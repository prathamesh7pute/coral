var _ = require('underscore');

var getRouteParams = function(path) {
  var params = [];
  _.each(path && path.split('/'), function(token) {
    if (token.indexOf(':') === 0) {
      params.push(token.slice(1, token.length));
    }
  });
  return params;
};

var processVal = function(val) {
  if (!isNaN(parseFloat(val)) && isFinite(val)) {
    return +val;
  }
  return val;
};

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
  var sort = req.query.sort,
    order = req.query.order,
    select = req.query.select,
    page = req.query.page,
    perPage = options.perPage || 20,
    skip = req.query.skip,
    limit = req.query.limit;

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
    filter: processFilters(req.query.filter),
    select: select ? select.replace(/,/g, ' ') : '',
    findAll: options.findAll === false ? false : true
  };
};


var util = {
  getRouteParams: getRouteParams,
  processFilters: processFilters,
  processRoute: processRoute
};

module.exports = util;