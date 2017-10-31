/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var db = require('./helper/db')
var express = require('express')
var request = require('supertest')

describe('Coral subDoc get tests', function () {
  before(function (done) {
    db.connect()
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  describe('Coral subDoc get config', function () {
    var app, config

    it('subDoc get - must create proper get route return all records if no queries provided', function (done) {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name'
        }
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .get('/localhost/articles/article-one/comments/comment-one')
        .set('accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.name.should.equal('comment-one')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('subDoc get - must create proper get route return sorted records if sort query provided', function (done) {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name',
          idParam: 'commentName',
          subDoc: {
            path: 'replies',
            idAttribute: 'name'
          }
        }
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .get('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
        .set('accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.name.should.equal('reply-one')
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
