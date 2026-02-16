/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import Query from '../../src/query.js'
import db from '../helper/db.js'
import express from 'express'
import should from 'should'
import request from 'supertest'
import { afterEach, beforeEach, describe, it } from 'vitest'
import type { Article, Location, User } from '../helper/models.js'
import type { CoralConfig } from '../../src/models/coral.js'
import type { Types } from 'mongoose'
const app = express()

describe('Coral put  updateRef tests', () => {
  // require to get req body parameters
  app.use(express.json())

  beforeEach(async () => {
    await db.connect()
    await db.initialise()
  })

  afterEach(async () => {
    await db.disconnect()
  })

  describe('update Ref - must update record and should not push new article reference', () => {
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

    it('put - must create proper post route and updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/article',
        model: db.getModel('Article') as unknown as import('mongoose').Model<unknown>,
        methods: ['PUT'],
        idAttribute: 'name',
        updateRef: {
          model: db.getModel('User') as unknown as import('mongoose').Model<unknown>,
          path: 'articles',
          findOneId: findOneUserId
        }
      }
      // data to be pass into post request
      const data = {
        name: 'test article 1'
      }

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .put(config.path + '/article-two')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.name.should.equal('test article 1')
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
      record.articles.length.should.equal(1)
      ;(record.articles[0] as unknown as Article).name.should.equal('article-one')
    })
  })

  describe('update Ref - must update record and should not update location reference', () => {
    let findOneUserId: Types.ObjectId

    // use this to retrive the findOneUserId
    beforeEach(async () => {
      const query = new Query<User>(db.getModel('User'))
      const locationQuery = new Query<Location>(db.getModel('Location'))
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

      // data to insert
      const data = {
        streetOne: 'buckland'
      }
      // invoke query create method
      const createdLocation = await locationQuery.create({}, data)
      if (!createdLocation || Array.isArray(createdLocation)) {
        throw new Error('Expected one created location')
      }
      createdLocation.streetOne.should.equal('buckland')
    })

    it('put - must create proper put route and and should not updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/location',
        model: db.getModel('Location') as unknown as import('mongoose').Model<unknown>,
        methods: ['PUT'],
        idAttribute: 'streetOne',
        updateRef: {
          model: db.getModel('User') as unknown as import('mongoose').Model<unknown>,
          path: 'location',
          findOneId: findOneUserId
        }
      }
      // data to be pass into post request
      const data = {
        streetOne: '345 Buckland Hills Dr'
      }

      // call router get with the config
      app.use(Coral(config))

      // invoke path with supertest
      const res = await request(app)
        .put(config.path + '/buckland')
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
      res.body.streetOne.should.equal('345 Buckland Hills Dr')
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
      should.not.exist(record.location)
    })
  })
})
