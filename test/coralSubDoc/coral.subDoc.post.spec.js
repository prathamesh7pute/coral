/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')
const app = express()

describe('Coral subDoc post tests', () => {
  // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach((done) => {
    db.connect()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  it('subDoc post - must create proper post route and return matching record', (done) => {
    // config to pass router find method
    const config = {
      path: '/localhost/articles/:name/comments',
      model: db.getModel('Article'),
      methods: ['POST'],
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    }

    // data to be pass into post request
    const data = {
      'name': 'comment-three',
      'body': 'Article One Third Comment',
      'replies': [{
        'name': 'reply-one',
        'body': 'Article One Third Comment First Reply'
      }]
    }

    // call router get with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .post('/localhost/articles/article-one/comments')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        res.body.name.should.equal('comment-three')
        done(err) // pass err so that fail expect errors will get caught
      })
  })

  xit('sub subDoc post - must create proper post route and return matching record', (done) => {
    // config to pass router find method
    const config = {
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
    }

    // data to be pass into post request
    const data = {
      'name': 'reply-three',
      'body': 'Article One Second Comment Third Reply'
    }

    // call router get with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .post('/localhost/articles/article-one/comments/comment-one/replies')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        res.body.name.should.equal('reply-three')
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
