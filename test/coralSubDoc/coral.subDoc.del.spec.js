/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')

describe('Coral subDoc del tests', () => {
  beforeEach((done) => {
    db.connect()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  let app, config

  it('subDoc del - must create proper del route and delete records', (done) => {
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
      .end((err, res) => {
        done(err) // pass err so that fail expect errors will get caught
      })
  })

  it('subDoc del - must create proper del route and delete records', (done) => {
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
      .end((err, res) => {
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
