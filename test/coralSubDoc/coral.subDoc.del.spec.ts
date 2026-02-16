/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { describe, it, beforeEach, afterEach } from 'vitest'

describe('Coral subDoc del tests', () => {
  beforeEach(async () => {
    await db.connect()
    await db.initialise()
  })

  afterEach(async () => {
    await db.disconnect()
  })

  let app, config

  it('subDoc del - must create proper del route and delete records', async () => {
    // config to pass router find method
    config = {
      path: '/localhost/articles/:articleName/comments',
      model: db.getModel('Article'),
      methods: ['DELETE'],
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
    await request(app)
      .del('/localhost/articles/article-one/comments/comment-one')
      .set('accept', 'application/json')
      .expect(200)
  })

  it('subDoc del - must create proper del route and delete records', async () => {
    // config to pass router find method
    config = {
      path: '/localhost/articles/:articleName/comments/:commentName/replies',
      model: db.getModel('Article'),
      methods: ['DELETE'],
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
    await request(app)
      .del('/localhost/articles/article-one/comments/comment-one/replies/reply-one')
      .set('accept', 'application/json')
      .expect(200)
  })
})
