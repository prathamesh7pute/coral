/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const app = express()

describe('Coral del tests', () => {
  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('del - must create proper del route and remove matching record', (done) => {
    // config for route
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name',
      methods: ['DELETE']
    }

    // call router put with the config
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .del(config.path + '/abc')
      .set('accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
