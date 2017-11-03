/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')
const app = express()

describe('Coral post tests', () => {
  // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach((done) => {
    db.connect()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  it('post - must create proper post route and return matching record', (done) => {
    // config to pass router find method
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      methods: ['POST']
    }

    // data to be pass into post request
    const data = {
      name: 'test',
      age: 40
    }

    // call router get with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .post(config.path)
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        res.body.name.should.equal('test')
        res.body.age.should.equal(40)
        done(err) // pass err so that fail expect errors will get caught
      })
  })

  it('post - must return bad request if improper request is send', (done) => {
    // config to pass router find method
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      methods: ['POST']
    }

    // data to be pass into post request
    const data = {
      name: 'test',
      email: 'invalid-email-id',
      age: 40
    }

    // call router get with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
        .post(config.path)
        .set('accept', 'application/json')
        .send(data)
        .expect(400, done)
  })
})
