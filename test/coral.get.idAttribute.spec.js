/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var db = require('./helper/db')
var should = require('should')
var express = require('express')
var request = require('supertest')

describe('Coral get with idAttribute tests', function () {
  before(function (done) {
    db.connect()
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  describe('Coral get config', function () {
    var app, config

    before(function () {
      // config to pass router find method
      config = {
        path: '/localhost/user',
        model: db.getModel('User'),
        idAttribute: 'name',
        methods: ['GET']
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))
    })

    it('get with idAttribute - must create proper get route and return exact record', function (done) {
      // invoke path with supertest
      request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          res.body.name.should.equal('abc')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('get with idAttribute - must create proper get route and return exact record with options', function (done) {
      // invoke path with supertest
      request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .query({
          select: 'name'
        })
        .expect(200)
        .end(function (err, res) {
          res.body.name.should.equal('abc')
          should.not.exists(res.body.age)
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
