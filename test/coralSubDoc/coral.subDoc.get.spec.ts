/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CoralConfig } from '../../src/models/coral.js'

describe('Coral subDoc get tests', () => {
  beforeAll(async () => {
    await db.connect()
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  describe('Coral subDoc get config', () => {
    let app: express.Express
    let config: CoralConfig

    it('subDoc get - must create proper get route return all records if no queries provided', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name'
        }
      }

      app = express()
      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .get('/localhost/articles/article-one/comments/comment-one')
        .set('accept', 'application/json')
        .expect(200)
      expect(res.body.name).toBe('comment-one')
    })

    it('subDoc get - must create proper get route return sorted records if sort query provided', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name',
          idParam: 'commentName',
          subDoc: {
            path: 'replies',
            idAttribute: 'name'
          }
        }
      }

      app = express()
      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .get('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
        .set('accept', 'application/json')
        .expect(200)
      expect(res.body.name).toBe('reply-one')
    })
  })
})
