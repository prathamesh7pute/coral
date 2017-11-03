/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')
const app = express()

describe('Coral put tests', () => {
  // require to get req body parameters
  app.use(bodyParser.json())

  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('put - must create proper put route and update matching record', (done) => {
    // config for route
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name',
      methods: ['PUT']
    }

    // data to be pass to update data
    const data = {
      name: 'test',
      age: 40
    }

    // call router put with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .put(config.path + '/abc')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        res.body.name.should.equal('test')
        res.body.age.should.equal(40)
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
