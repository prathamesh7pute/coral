/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { describe, it, beforeAll, afterAll } from 'vitest'
const app = express()

describe('Coral put tests', () => {
  // require to get req body parameters
  app.use(express.json())

  beforeAll(async () => {
    await db.connect()
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  it('put - must create proper put route and update matching record', async () => {
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
    app.use(Coral(config))

    // invoke path with supertest
    const res = await request(app)
      .put(config.path + '/abc')
      .set('accept', 'application/json')
      .send(data)
      .expect(200)
    res.body.name.should.equal('test')
    res.body.age.should.equal(40)
  })
})
