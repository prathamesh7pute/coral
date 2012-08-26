/**
 * Test dependencies.
 */

var coral = require('../lib/coral'),
	should = require('should');

/**
 * Tests.
 */
describe('coral', function() {

	it('must expose version number', function() {
		coral.version.should.match(/[0-9]+\.[0-9]+\.[0-9]+/);
	});
	
});