/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')

describe('Coral get tests', () => {
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
        methods: ['GET']
      }

      app = express()
      // call router get with the config
      app.use(new Coral(config))
    })

    it('get - must create proper get route return all records if no queries provided', (done) => {
      // invoke path with supertest
      request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          res.body.length.should.equal(3)
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('get - must create proper get route return sorted records if sort query provided (ascending)', (done) => {
      // invoke path with supertest
      request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .query({
          sort: 'name',
          order: 'asc'
        })
        .expect(200)
        .end((err, res) => {
          res.body.length.should.equal(3)
          res.body[0].name.should.equal('abc')
          res.body[1].name.should.equal('def')
          res.body[2].name.should.equal('xyz')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    it('get - must create proper get route return sorted records if sort query provided (descending)', (done) => {
      // invoke path with supertest
      request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .query({
          sort: 'name',
          order: 'desc'
        })
        .expect(200)
        .end((err, res) => {
          res.body.length.should.equal(3)
          res.body[0].name.should.equal('xyz')
          res.body[1].name.should.equal('def')
          res.body[2].name.should.equal('abc')
          done(err) // pass err so that fail expect errors will get caught
        })
    })
  })
})
