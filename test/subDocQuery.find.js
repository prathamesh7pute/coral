/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery'),
    db = require('./helper/db'),
    should = require('should');

describe('subDocQuery find tests', function() {
    var subDocQuery;

    before(function() {
        db.connect();
        subDocQuery = new SubDocQuery(db.getModel('Article'));
    });

    after(function(done) {
        db.disconnect(done);
    });

    beforeEach(function(done) {
        db.initialise(done);
    });

    it('find subDoc - must return all available records', function(done) {

        var config = {
            conditions: {
                name: 'article-one'
            },
            subDoc: {
                path: 'comments'
            }
        };

        subDocQuery.find(config, function(err, records) {
            records.length.should.equal(2);
            done();
        });

    });

    it('find subDoc subDoc - must return all available records', function(done) {

        var config = {
            conditions: {
                name: 'article-one'
            },
            subDoc: {
                path: 'comments',
                conditions: {
                    name: 'comment-two'
                },
                subDoc: {
                    path: 'replies'
                }
            }
        };

        subDocQuery.find(config, function(err, records) {
            records.length.should.equal(2);
            done();
        });

    });

});