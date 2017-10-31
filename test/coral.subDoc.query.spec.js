/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var db = require('./helper/db')
var express = require('express')
var request = require('supertest')

describe('Coral subDoc query tests', function () {
  before(function (done) {
    db.connect()
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  describe('Coral subDoc query config', function () {
    var app, config

    before(function () {})

    it('subDoc query - must create proper get route return all records if no queries provided', function (done) {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:name/comments',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'name',
        subDoc: {
          path: 'comments'
        }
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .get('/localhost/articles/article-one/comments')
        .set('accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.length.should.equal(2)
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('subDoc query - must create proper get route return sorted records if sort query provided', function (done) {
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
            path: 'replies'
          }
        }
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .get('/localhost/articles/article-one/comments/comment-one/replies')
        .set('accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.length.should.equal(1)
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
