/**
 * Test dependencies.
 */
var Coral = require('../lib/coral'),
  db = require('./helper/db'),
  should = require('should'),
  express = require('express'),
  request = require('supertest'),
  bodyParser = require('body-parser'),
  app = express();

describe('Coral subDoc post tests', function() {

  //require to get req body parameters
  app.use(bodyParser.json());

  beforeEach(function(done) {
    db.connect();
    db.initialise(done);
  });

  after(function(done) {
    db.disconnect(done);
  });

  it('subDoc post - must create proper post route and return matching record', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/articles/:name/comments',
      model: db.getModel('Article'),
      methods: ['POST'],
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    };

    //data to be pass into post request
    var data = {
      'name': 'comment-three',
      'body': 'Article One Third Comment',
      'replies': [{
        'name': 'reply-one',
        'body': 'Article One Third Comment First Reply'
      }]
    };


    //call router get with the config
    app.use(new Coral(config));

    //invoke path with supertest
    request(app)
      .post('/localhost/articles/article-one/comments')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.equal('comment-three');
        done(err); //pass err so that fail expect errors will get caught
      });

  });

  it('sub subDoc post - must create proper post route and return matching record', function(done) {
    //config to pass router find method
    var config = {
      path: '/localhost/articles/:articleName/comments/:commentName/replies',
      model: db.getModel('Article'),
      methods: ['POST'],
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        idAttribute: 'name',
        idParam: 'commentName',
        subDoc: {
          path: 'replies'
        }
      }
    };

    //data to be pass into post request
    var data = {
      'name': 'reply-three',
      'body': 'Article One Second Comment Third Reply'
    };

    //call router get with the config
    app.use(new Coral(config));

    //invoke path with supertest
    request(app)
      .post('/localhost/articles/article-one/comments/comment-one/replies')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end(function(err, res) {
        res.body.name.should.equal('reply-three');
        done(err); //pass err so that fail expect errors will get caught
      });

  });

});