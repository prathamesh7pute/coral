/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const db = require('../helper/db')
const express = require('express')
const should = require('should')
const request = require('supertest')

describe('Coral query tests', () => {
  let app

  beforeEach((done) => {
    db.connect()
    app = express()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  it('coral query - must create proper routes and return results according to query provided', (done) => {
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
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        const records = res.body
        records.length.should.equal(1)
        should.exist(records[0].name)
        should.exist(records[0].age)
        should.not.exist(records[0]._id)
        done(err) // pass err so that fail expect errors will get caught
      })
  })

  it('coral query - must return sorted records with overrrided parameters from routes', (done) => {
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
    app.use(new Coral(config))

    // invoke path with supertest
    request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .query({
        sort: 'name'
      })
      .expect(200)
      .end((err, res) => {
        res.body.length.should.equal(3)
        res.body[0].name.should.equal('xyz')
        res.body[1].name.should.equal('def')
        res.body[2].name.should.equal('abc')
        done(err) // pass err so that fail expect errors will get caught
      })
  })
})
