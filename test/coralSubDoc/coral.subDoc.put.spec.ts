/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { afterAll, beforeAll, describe, it } from 'vitest'
import type { CoralConfig } from '../../src/models/coral.js'

describe('Coral subDoc put tests', () => {
  beforeAll(async () => {
    await db.connect()
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  describe('Coral subDoc put config', () => {
    let app: express.Express
    let config: CoralConfig

    beforeAll(() => {})

    it('subDoc put - must create proper put route', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments',
        model: db.getModel('Article'),
        methods: ['PUT'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name'
        }
      }

      // data to be pass into post request
      const data = {
        body: 'Article One First Comment - modified'
      }

      app = express()

      // require to get req body parameters
      app.use(express.json())

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .put('/localhost/articles/article-one/comments/comment-one')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.name.should.equal('comment-one')
      res.body.body.should.equal('Article One First Comment - modified')
    })

    it('subDoc put - must create proper put route to update records', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['PUT'],
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

      // data to be pass into post request
      const data = {
        body: 'Article One First Comment First Reply - modified'
      }

      app = express()

      // require to get req body parameters
      app.use(express.json())

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .put('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.name.should.equal('reply-one')
      res.body.body.should.equal('Article One First Comment First Reply - modified')
    })
  })
})
