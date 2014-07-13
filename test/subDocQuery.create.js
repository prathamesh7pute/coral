/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery'),
    db = require('./helper/db'),
    should = require('should');

describe('subDocQuery create tests', function() {
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

    it('create subDoc - must create record with data passed', function(done) {
        var config = {
            conditions: {
                name: 'article-one'
            },
            subDoc: {
                path: 'comments'
            }
        };

        var data = {
            'name': 'comment-three',
            'body': 'Article One Third Comment',
            'replies': [{
                'name': 'reply-one',
                'body': 'Article One Third Comment First Reply'
            }]
        };

        subDocQuery.create(config, data, function(err, record) {
            record.name.should.equal('comment-three');
            should.exist(record._id);
            done();
        });

    });

    it('create subDoc subDoc - must create record with data passed', function(done) {
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

        var data = {
            'name': 'reply-three',
            'body': 'Article One Second Comment Third Reply'
        };

        subDocQuery.create(config, data, function(err, record) {
            record.name.should.equal('reply-three');
            should.exist(record._id);
            done();
        });

    });

});