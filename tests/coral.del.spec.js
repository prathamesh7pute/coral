/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var db = require('./helper/db')
var express = require('express')
var request = require('supertest')
var app = express()

describe('Coral del tests', function () {
  before(function (done) {
    db.connect()
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  it('del - must create proper del route and remove matching record', function (done) {
    // config for route
    var config = {
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
      .end(function (err, res) {
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
