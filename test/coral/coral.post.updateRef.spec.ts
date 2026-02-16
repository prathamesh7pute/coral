/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import Query from '../../src/query.js'
import db from '../helper/db.js'
import express from 'express'
import request from 'supertest'
import { afterEach, beforeEach, describe, it } from 'vitest'
import type { Article, Location, User } from '../helper/models.js'
import type { CoralConfig } from '../../src/models/coral.js'
import type { Types } from 'mongoose'
const app = express()

describe('Coral post updateRef tests', () => {
  // require to get req body parameters
  app.use(express.json())

  beforeEach(async () => {
    await db.connect()
    await db.initialise()
  })

  afterEach(async () => {
    await db.disconnect()
  })

  describe('update Ref - must add record the push article reference', () => {
    let findOneUserId: Types.ObjectId

    // use this to retrive the findOneUserId
    beforeEach(async () => {
      const query = new Query<User>(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10
        },
        options: {
          populate: 'articles'
        }
      }
      const record = await query.findOne(config)
      if (!record) throw new Error('Expected user record')
      record.name.should.equal('abc')
      record.articles.length.should.equal(1)
      findOneUserId = record._id
    })

    it('post - must create proper post route and updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/article',
        model: db.getModel('Article') as unknown as import('mongoose').Model<unknown>,
        methods: ['POST'],
        updateRef: {
          model: db.getModel('User') as unknown as import('mongoose').Model<unknown>,
          path: 'articles',
          findOneId: findOneUserId
        }
      }
      // data to be pass into post request
      const data = {
        name: 'test article'
      }

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .post(config.path)
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.name.should.equal('test article')
    })

    // verify that the article reference properly got inserted
    afterEach(async () => {
      const query = new Query<User>(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId
        },
        options: {
          populate: 'articles'
        }
      }

      const record = await query.findOne(config)
      if (!record) throw new Error('Expected user record')
      record.name.should.equal('abc')
      record.articles.length.should.equal(2)
      ;(record.articles[1] as unknown as Article).name.should.equal('test article')
    })
  })

  describe('update Ref - must add record the update location reference', () => {
    let findOneUserId: Types.ObjectId

    // use this to retrive the findOneUserId
    beforeEach(async () => {
      const query = new Query<User>(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10
        }
      }
      const record = await query.findOne(config)
      if (!record) throw new Error('Expected user record')
      record.name.should.equal('abc')
      findOneUserId = record._id
    })

    it('post - must create proper post route and updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/location',
        model: db.getModel('Location') as unknown as import('mongoose').Model<unknown>,
        methods: ['POST'],
        updateRef: {
          model: db.getModel('User') as unknown as import('mongoose').Model<unknown>,
          path: 'location',
          findOneId: findOneUserId
        }
      }
      // data to be pass into post request
      const data = {
        streetOne: '250 Main St',
        city: 'Hartford',
        state: 'CT'
      }

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .post(config.path)
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.streetOne.should.equal('250 Main St')
    })

    // verify that the article reference properly got inserted
    afterEach(async () => {
      const query = new Query<User>(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId
        },
        options: {
          populate: 'location'
        }
      }

      const record = await query.findOne(config)
      if (!record) throw new Error('Expected user record')
      record.name.should.equal('abc')
      ;(record.location as unknown as Location).streetOne.should.equal('250 Main St')
    })
  })
})
