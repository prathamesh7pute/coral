/**
 * Test dependencies.
 */
import Coral from '../../src/coral.js'
import db from '../helper/db.js'
import express from 'express'
import should from 'should'
import request from 'supertest'
import { describe, it, beforeEach, afterEach } from 'vitest'

describe('Coral query tests', () => {
  let app

  beforeEach(async () => {
    await db.connect()
    app = express()
    await db.initialise()
  })

  afterEach(async () => {
    await db.disconnect()
  })

  it('coral query - must create proper routes and return results according to query provided', async () => {
    // config to pass
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        conditions: {
          age: {
            $lte: 20
          },
          name: {
            $in: ['abc', 'xyz']
          }
        },
        fields: 'name age -_id',
        options: {
          skip: 0,
          limit: 10,
          sort: 'name'
        }
      }
    }

    // call coral router with the config
    app.use(Coral(config))

    // invoke path with supertest
    const res = await request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .expect(200)

    const records = res.body
    records.length.should.equal(1)
    should.exist(records[0].name)
    should.exist(records[0].age)
    should.not.exist(records[0]._id)
  })

  it('coral query - must return sorted records with overrrided parameters from routes', async () => {
    // config to pass
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        options: {
          sort: '-name'
        }
      }
    }

    // call coral router with the config
    app.use(Coral(config))

    // invoke path with supertest
    const res = await request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .query({
        sort: 'name'
      })
      .expect(200)

    res.body.length.should.equal(3)
    res.body[0].name.should.equal('xyz')
    res.body[1].name.should.equal('def')
    res.body[2].name.should.equal('abc')
  })
})
