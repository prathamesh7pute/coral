/**
 * Test dependencies.
 */
const Coral = require('../../lib/coral')
const Query = require('../../lib/query')
const db = require('../helper/db')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')
const app = express()

describe('Coral post updateRef tests', () => {
  // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach((done) => {
    db.connect()
    db.initialise(done)
  })

  afterEach((done) => {
    db.disconnect(done)
  })

  describe('update Ref - must add record the push article reference', () => {
    let findOneUserId

    // use this to retrive the findOneUserId
    beforeEach((done) => {
      const query = new Query(db.getModel('User'))
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
      query.findOne(config, (err, record) => {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        record.articles.length.should.equal(1)
        findOneUserId = record._id
        done()
      })
    })

    it('post - must create proper post route and updateReference ', (done) => {
      // config to pass router find method
      const config = {
        path: '/localhost/article',
        model: db.getModel('Article'),
        methods: ['POST'],
        updateRef: {
          model: db.getModel('User'),
          path: 'articles',
          findOneId: findOneUserId
        }
      }
      // data to be pass into post request
      const data = {
        name: 'test article'
      }

      // call router get with the config
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .post(config.path)
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
        .end((err, res) => {
          res.body.name.should.equal('test article')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    // verify that the article reference properly got inserted
    afterEach((done) => {
      const query = new Query(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId
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
        record.articles.length.should.equal(2)
        record.articles[1].name.should.equal('test article')
        done()
      })
    })
  })

  describe('update Ref - must add record the update location reference', () => {
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

    it('post - must create proper post route and updateReference ', (done) => {
      // config to pass router find method
      const config = {
        path: '/localhost/location',
        model: db.getModel('Location'),
        methods: ['POST'],
        updateRef: {
          model: db.getModel('User'),
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
      app.use(new Coral(config))

      // invoke path with supertest
      request(app)
        .post(config.path)
        .set('accept', 'application/json')
        .send(data)
        .expect(200)
        .end((err, res) => {
          res.body.streetOne.should.equal('250 Main St')
          done(err) // pass err so that fail expect errors will get caught
        })
    })

    // verify that the article reference properly got inserted
    afterEach((done) => {
      const query = new Query(db.getModel('User'))
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId
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
        record.location.streetOne.should.equal('250 Main St')
        done()
      })
    })
  })
})
