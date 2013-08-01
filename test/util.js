/**
 * Test dependencies.
 */
describe('util', function() {

	var should = require('should'),
		util = require('../lib/util');

	it('getRouteParams - must return proper params', function() {
		var params = util.getRouteParams('/brand/:bid/product/:pid/specification');
		params.should.have.length(2);
		params[0].should.equal('bid');
		params[1].should.equal('pid');
	});


	it('processFilters - must return processed filters', function() {
		var filter;
		// = 
		filter = util.processFilters('name=abc,age>10,weight<150,height>=68,chest<=30,eyes!=blue');
		filter.should.have.property('name', 'abc');
		filter.name.should.equal('abc');
		// > 
		filter.should.have.property('age');
		filter.age.should.have.property('$gt', 10);
		// <
		filter.should.have.property('weight');
		filter.weight.should.have.property('$lt', 150);
		// >=
		filter.should.have.property('height');
		filter.height.should.have.property('$gte', 68);
		// <=
		filter.should.have.property('chest');
		filter.chest.should.have.property('$lte', 30);
		// <=
		filter.should.have.property('eyes');
		filter.eyes.should.have.property('$ne', 'blue');

	});

	it('processRoute - must process route properly when page is pass', function() {
		var req = {
			query: {
				page: '0'
			}
		};
		var options = {
			perPage: 10
		};
		var route = util.processRoute(req, options);
		route.skip.should.equal(0);
		route.limit.should.equal(10);
		should.not.exist(route.sort);
	});

	it('processRoute - must process route properly when page is pass with sort order asc', function() {
		var req = {
			query: {
				page: '0',
				sort: 'name',
				order: 'asc'
			}
		};
		var options = {
			perPage: 10
		};
		var route = util.processRoute(req, options);
		route.skip.should.equal(0);
		route.limit.should.equal(10);
		route.sort.should.equal('name');
	});

	it('processRoute - must process route properly when page is pass with sort order desc', function() {
		var req = {
			query: {
				page: '0',
				sort: 'name',
				order: 'desc'
			}
		};
		var options = {
			perPage: 10
		};
		var route = util.processRoute(req, options);
		route.skip.should.equal(0);
		route.limit.should.equal(10);
		route.sort.should.equal('-name');
	});

	it('processRoute - must process route properly when page is not pass', function() {
		var req = {
			query: {
				skip: 0,
				limit: 20
			}
		};
		var options = {
			perPage: 10
		};
		var route = util.processRoute(req, options);
		should.not.exist(route.sort);
		route.skip.should.equal(0);
		route.limit.should.equal(20);
	});

});