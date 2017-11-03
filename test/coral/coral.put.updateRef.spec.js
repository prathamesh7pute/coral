/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const Query = require('../../lib/query')
const db = require('../helper/db')
const express = require('express')
const should = require('should')
const request = require('supertest')
const bodyParser = require('body-parser')
const app = express()

describe('Coral put  updateRef tests', () => {
    // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach((done) => {
    db.connect()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  describe('update Ref - must update record and should not push new article reference', () => {
    let findOneUserId

        // use this to retrive the findOneUserId
    beforeEach((done) => {
      const query = new Query(db.getModel('User'))
            // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10
        }
      }
      query.findOne(config, (err, record) => {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        findOneUserId = record._id
        done()
      })
    })

    it('put - must create proper post route and updateReference ', (done) => {
            // config to pass router find method
      const config = {
        path: '/localhost/article',
        model: db.getModel('Article'),
        methods: ['PUT'],
        idAttribute: 'name',
        updateRef: {
          model: db.getModel('User'),
          path: 'articles',
          findOneId: findOneUserId
        }
      }
            // data to be pass into post request
      const data = {
        name: 'test article 1'
      }

            // call router get with the config
      app.use(new Coral(config))

            // invoke path with supertest
      request(app)
                .put(config.path + '/article-two')
                .set('accept', 'application/json')
                .send(data)
                .expect(200)
                .end((err, res) => {
                  res.body.name.should.equal('test article 1')
                  done(err) // pass err so that fail expect errors will get caught
                })
    })

        // verify that the article reference properly got inserted
    afterEach((done) => {
      const query = new Query(db.getModel('User'))
            // unique identifier to find data
      const config = {
        conditions: {
          '_id': findOneUserId
        },
        options: {
          populate: 'articles'
        }
      }

      query.findOne(config, (err, record) => {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        record.articles.length.should.equal(1)
        record.articles[0].name.should.equal('article-one')
        done()
      })
    })
  })

  describe('update Ref - must update record and should not update location reference', () => {
    let findOneUserId

        // use this to retrive the findOneUserId
    beforeEach((done) => {
      const query = new Query(db.getModel('User'))
      const locationQuery = new Query(db.getModel('Location'))
            // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10
        }
      }
      query.findOne(config, (err, record) => {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        findOneUserId = record._id

                // data to insert
        const data = {
          streetOne: 'buckland'
        }
                // invoke query create method
        locationQuery.create({}, data, (err, record) => {
          if (err) {
            throw err
          }
          record.streetOne.should.equal('buckland')
          done()
        })
      })
    })

    it('put - must create proper put route and and should not updateReference ', (done) => {
            // config to pass router find method
      const config = {
        path: '/localhost/location',
        model: db.getModel('Location'),
        methods: ['PUT'],
        idAttribute: 'streetOne',
        updateRef: {
          model: db.getModel('User'),
          path: 'location',
          findOneId: findOneUserId
        }
      }
            // data to be pass into post request
      const data = {
        streetOne: '345 Buckland Hills Dr'
      }

            // call router get with the config
      app.use(new Coral(config))

            // invoke path with supertest
      request(app)
                .put(config.path + '/buckland')
                .set('accept', 'application/json')
                .send(data)
                .expect(200)
                .end((err, res) => {
                  res.body.streetOne.should.equal('345 Buckland Hills Dr')
                  done(err) // pass err so that fail expect errors will get caught
                })
    })

        // verify that the article reference properly got inserted
    afterEach((done) => {
      const query = new Query(db.getModel('User'))
            // unique identifier to find data
      const config = {
        conditions: {
          '_id': findOneUserId
        },
        options: {
          populate: 'location'
        }
      }

      query.findOne(config, (err, record) => {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        should.not.exist(record.location)
        done()
      })
    })
  })
})
