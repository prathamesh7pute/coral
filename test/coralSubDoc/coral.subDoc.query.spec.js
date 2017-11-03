/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')

describe('Coral subDoc query tests', () => {
  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  describe('Coral subDoc query config', () => {
    let app, config

    before(() => {})

    it('subDoc query - must create proper get route return all records if no queries provided', (done) => {
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
        .end((err, res) => {
          res.body.length.should.equal(2)
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('subDoc query - must create proper get route return sorted records if sort query provided', (done) => {
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
        .end((err, res) => {
          res.body.length.should.equal(1)
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
