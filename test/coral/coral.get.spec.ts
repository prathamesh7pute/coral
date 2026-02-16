/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { afterAll, beforeAll, describe, it } from 'vitest'
import type { CoralConfig } from '../../src/models/coral.js'

describe('Coral get tests', () => {
  beforeAll(async () => {
    await db.connect()
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  describe('Coral get config', () => {
    let app: express.Express
    let config: CoralConfig

    beforeAll(() => {
      // config to pass router find method
      config = {
        path: '/api/user',
        model: db.getModel('User'),
        methods: ['GET']
      }

      app = express()
      // call router get with the config
      app.use(Coral(config))
    })

    it('get - must create proper get route return all records if no queries provided', async () => {
      // invoke path with supertest
      const res = await request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .expect(200)
      res.body.length.should.equal(3)
    })

    it('get - must create proper get route return sorted records if sort query provided (ascending)', async () => {
      // invoke path with supertest
      const res = await request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .query({
          sort: 'name',
          order: 'asc'
        })
        .expect(200)
      res.body.length.should.equal(3)
      res.body[0].name.should.equal('abc')
      res.body[1].name.should.equal('def')
      res.body[2].name.should.equal('xyz')
    })

    it('get - must create proper get route return sorted records if sort query provided (descending)', async () => {
      // invoke path with supertest
      const res = await request(app)
        .get(config.path)
        .set('accept', 'application/json')
        .query({
          sort: 'name',
          order: 'desc'
        })
        .expect(200)
      res.body.length.should.equal(3)
      res.body[0].name.should.equal('xyz')
      res.body[1].name.should.equal('def')
      res.body[2].name.should.equal('abc')
    })
  })
})
