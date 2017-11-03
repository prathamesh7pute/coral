/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')

describe('Coral subDoc put tests', () => {
  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  describe('Coral subDoc put config', () => {
    let app, config

    before(() => {})

    it('subDoc put - must create proper put route', (done) => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments',
        model: db.getModel('Article'),
        methods: ['PUT'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name'
        }
      }

      // data to be pass into post request
      const data = {
        'body': 'Article One First Comment - modified'
      }

      app = express()

      // require to get req body parameters
      app.use(bodyParser.json())

      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .put('/localhost/articles/article-one/comments/comment-one')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
        .end((err, res) => {
          res.body.name.should.equal('comment-one')
          res.body.body.should.equal('Article One First Comment - modified')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('subDoc put - must create proper put route to update records', (done) => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['PUT'],
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

      // data to be pass into post request
      const data = {
        'body': 'Article One First Comment First Reply - modified'
      }

      app = express()

      // require to get req body parameters
      app.use(bodyParser.json())

      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .put('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
        .end((err, res) => {
          res.body.name.should.equal('reply-one')
          res.body.body.should.equal('Article One First Comment First Reply - modified')
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
