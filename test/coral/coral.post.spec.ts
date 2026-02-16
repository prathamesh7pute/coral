/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { describe, it, beforeEach, afterEach } from 'vitest'
const app = express()

describe('Coral post tests', () => {
  // require to get req body parameters
  app.use(express.json())

  beforeEach(async () => {
    await db.connect()
    await db.initialise()
  })

  afterEach(async () => {
    await db.disconnect()
  })

  it('post - must create proper post route and return matching record', async () => {
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
    app.use(Coral(config))

    // invoke path with supertest
    const res = await request(app)
      .post(config.path)
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
    res.body.name.should.equal('test')
    res.body.age.should.equal(40)
  })

  it('post - must return bad request if improper request is send', async () => {
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
    app.use(Coral(config))

    // invoke path with supertest
    await request(app)
      .post(config.path)
      .set('accept', 'application/json')
      .send(data)
      .expect(400)
  })
})
