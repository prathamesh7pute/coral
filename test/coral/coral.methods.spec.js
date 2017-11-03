/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')

describe('Coral methods tests', () => {
  before((done) => {
    db.connect()
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  describe('no methods - must create all required routes', (done) => {
    let config, app

    before(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User')
      }
      app = express()
      app.use(new Coral(config))
    })

    // without idAttributes
    it('get - must create proper get route', (done) => {
      request(app)
        .get(config.path)
        .expect(200, done)
    })

    it('post - must create proper post route', (done) => {
      request(app)
        .post(config.path)
        .expect(200, done)
    })

    it('put - must create proper put route', (done) => {
      request(app)
        .put(config.path)
        .expect(404, done)
    })

    it('del - must create proper del route', (done) => {
      request(app)
        .del(config.path)
        .expect(404, done)
    })

    // with idAttributes
    it('get - must create proper get route with idAttribute', (done) => {
      request(app)
        .get(config.path + '/abc')
        .expect(200, done)
    })

    it('post - must create proper post route with idAttribute', (done) => {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done)
    })

    it('put - must create proper put route with idAttribute', (done) => {
      request(app)
        .put(config.path + '/abc')
        .expect(200, done)
    })

    it('del - must create proper del route with idAttribute', (done) => {
      request(app)
        .del(config.path + '/abc')
        .expect(200, done)
    })
  })

  describe('get, put - must create only get, put route', (done) => {
    let config, app

    before(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['GET', 'PUT']
      }
      app = express()
      app.use(new Coral(config))
    })

    // without idAttributes
    it('get - must create proper get route', (done) => {
      request(app)
        .get(config.path)
        .expect(200, done)
    })

    it('post - must create proper post route', (done) => {
      request(app)
        .post(config.path)
        .expect(404, done)
    })

    it('put - must create proper put route', (done) => {
      request(app)
        .put(config.path)
        .expect(404, done)
    })

    it('del - must create proper del route', (done) => {
      request(app)
        .del(config.path)
        .expect(404, done)
    })

    // with idAttributes
    it('get - must create proper get route with idAttribute', (done) => {
      request(app)
        .get(config.path + '/abc')
        .expect(200, done)
    })

    it('post - must create proper post route with idAttribute', (done) => {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done)
    })

    it('put - must create proper put route with idAttribute', (done) => {
      request(app)
        .put(config.path + '/abc')
        .expect(200, done)
    })

    it('del - must create proper del route with idAttribute', (done) => {
      request(app)
        .del(config.path + '/abc')
        .expect(404, done)
    })
  })

  describe('post, delete - must create only post, delete route', (done) => {
    let config, app

    before(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['POST', 'DELETE']
      }
      app = express()
      app.use(new Coral(config))
    })

    // without idAttributes
    it('get - must create proper get route', (done) => {
      request(app)
        .get(config.path)
        .expect(404, done)
    })

    it('post - must create proper post route', (done) => {
      request(app)
        .post(config.path)
        .expect(200, done)
    })

    it('put - must create proper put route', (done) => {
      request(app)
        .put(config.path)
        .expect(404, done)
    })

    it('del - must create proper del route', (done) => {
      request(app)
        .del(config.path)
        .expect(404, done)
    })

    // with idAttributes
    it('get - must create proper get route with idAttribute', (done) => {
      request(app)
        .get(config.path + '/abc')
        .expect(404, done)
    })

    it('post - must create proper post route with idAttribute', (done) => {
      request(app)
        .post(config.path + '/abc')
        .expect(404, done)
    })

    it('put - must create proper put route with idAttribute', (done) => {
      request(app)
        .put(config.path + '/abc')
        .expect(404, done)
    })

    it('del - must create proper del route with idAttribute', (done) => {
      request(app)
        .del(config.path + '/abc')
        .expect(200, done)
    })
  })
})
