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

});