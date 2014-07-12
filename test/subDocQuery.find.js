/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery'),
    db = require('./helper/db'),
    should = require('should');

describe('subDocQuery find tests', function() {
    var subDocQuery;

    before(function () {
        db.connect();
        subDocQuery = new SubDocQuery(db.getModel('Article'));
    });

    after(function (done) {
        db.disconnect(done);
    });

    beforeEach(function (done) {
        db.initialise(done);
    });

    it('find subDoc - must return all available records', function (done) {

        var config = {
            conditions: {
                name: 'article-one'
            },
            subDoc: {
                path: 'comments'
            }
        };

        subDocQuery.find(config, function (err, records) {
            records.length.should.equal(2);
            done();
        });

    });


//    {
//        "name": "article-one",
//        "title": "Article One",
//        "body": "Coral - Node JS framework to dynamically create REST application with express and mongoose Models",
//        "comments": [{
//        "body": "Article One First Comment",
//        "replies": [{
//            "body": "Article One First Comment First Reply"
//        }]
//    }, {
//        "body": "Article One Second Comment",
//        "replies": [{
//            "body": "Article One Second Comment First Reply"
//        }, {
//            "body": "Article One Second Comment Second Reply"
//        }]
//    }]
//    }

//    it('find subDoc subDoc - must return all available records', function (done) {
//
//        var config = {
//            subDoc: {
//                path: 'comments',
//                subDoc: {
//                    path: 'replies'
//                }
//            }
//        };
//
//        subDocQuery.find(config, function (err, records) {
//            console.log(records);
//            records.length.should.equal(2);
//            done();
//        });
//
//    });

});