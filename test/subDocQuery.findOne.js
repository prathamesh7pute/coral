/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery'),
    db = require('./helper/db'),
    should = require('should');

describe('subDocQuery findOne tests', function() {
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

    it('findOne subDoc - must return one specific available record', function(done) {

        var config = {
            conditions: {
                name: 'article-one'
            },
            subDoc: {
                path: 'comments',
                conditions: {
                    name: 'comment-one'
                }
            }
        };

        subDocQuery.findOne(config, function(err, record) {
            record.name.should.equal('comment-one');
            record.body.should.equal('Article One First Comment');
            done();
        });

    });

    it('findOne subDoc subDoc - must return one specific available record', function(done) {

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
                    path: 'replies',
                    conditions: {
                        name: 'reply-two'
                    }
                }
            }
        };

        subDocQuery.findOne(config, function(err, record) {
            record.name.should.equal('reply-two');
            record.body.should.equal('Article One Second Comment Second Reply');
            done();
        });

    });

});