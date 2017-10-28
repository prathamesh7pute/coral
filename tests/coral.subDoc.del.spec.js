/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var db = require('./helper/db')
var express = require('express')
var request = require('supertest')

xdescribe('Coral subDoc del tests', function () {
  beforeEach(function (done) {
    db.connect()
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  describe('Coral subDoc del config', function () {
    var app, config

    it('subDoc del - must create proper del route and delete records', function (done) {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments',
        model: db.getModel('Article'),
        methods: ['DELETE'],
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
        .del('/localhost/articles/article-one/comments/comment-one')
        .set('accept', 'application/json')
        .end(function (err, res) {
          console.log(err)
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('subDoc del - must create proper del route and delete records', function (done) {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['DELETE'],
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
        .del('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
        .set('accept', 'application/json')
        .end(function (err, res) {
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
