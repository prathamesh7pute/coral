/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CoralConfig } from '../../src/models/coral.js'

describe('Coral get with idAttribute tests', () => {
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
        idAttribute: 'name',
        methods: ['GET']
      }

      app = express()
      // call router get with the config
      app.use(Coral(config))
    })

    it('get with idAttribute - must create proper get route and return exact record', async () => {
      // invoke path with supertest
      const res = await request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .expect(200)
      expect(res.body.name).toBe('abc')
    })

    it('get with idAttribute - must create proper get route and return exact record with options', async () => {
      // invoke path with supertest
      const res = await request(app)
        .get(config.path + '/abc')
        .set('accept', 'application/json')
        .query({
          select: 'name'
        })
        .expect(200)
      expect(res.body.name).toBe('abc')
      expect(res.body.age).toBeUndefined()
    })
  })
})
