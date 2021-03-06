/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const should = require('should')
const express = require('express')
const request = require('supertest')

describe('Coral get with idAttribute tests', () => {
  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  describe('Coral get config', () => {
    let app, config

    before(() => {
      // config to pass router find method
      config = {
        path: '/api/user',
        model: db.getModel('User'),
        idAttribute: 'name',
        methods: ['GET']
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))
    })

    it('get with idAttribute - must create proper get route and return exact record', (done) => {
      // invoke path with supertest
      request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          console.log(err)
          res.body.name.should.equal('abc')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('get with idAttribute - must create proper get route and return exact record with options', (done) => {
      // invoke path with supertest
      request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .query({
          select: 'name'
        })
        .expect(200)
        .end((err, res) => {
          res.body.name.should.equal('abc')
          should.not.exists(res.body.age)
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
