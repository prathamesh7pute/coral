/**
 * Test dependencies.
 */
describe('util', function() {

	var should = require('should'),
		util = require('../lib/util');

	it('getParams - must return proper params', function() {
		var params = util.getParams('/brand/:bid/product/:pid/specification');
		params.should.have.length(2);
		params[0].should.equal('bid');
		params[1].should.equal('pid');
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
		route.page.should.equal('0');
		route.sort.should.equal(false);
		route.perPage.should.equal(10);
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
		route.page.should.equal('0');
		route.sort.should.equal('name');
		route.perPage.should.equal(10);
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
		route.page.should.equal('0');
		route.sort.should.equal('-name');
		route.perPage.should.equal(10);
	});

	it('processRoute - must process route properly when page is not pass', function() {
		var req = {
			query: {
				skip: '0',
				limit: '20'
			}
		};
		var options = {
			perPage: 10
		};
		var route = util.processRoute(req, options);
		route.sort.should.equal(false);
		route.skip.should.equal('0');
		route.limit.should.equal('20');
	});

});