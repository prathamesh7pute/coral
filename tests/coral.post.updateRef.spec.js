/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var Query = require('../lib/query')
var db = require('./helper/db')
var express = require('express')
var request = require('supertest')
var bodyParser = require('body-parser')
var app = express()

describe('Coral post updateRef tests', function () {
    // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach(function (done) {
    db.connect()
    db.initialise(done)
  })

  afterEach(function (done) {
    db.disconnect(done)
  })

  describe('update Ref - must add record the push article reference', function () {
    var findOneUserId

        // use this to retrive the findOneUserId
    beforeEach(function (done) {
      var query = new Query(db.getModel('User'))
            // unique identifier to find data
      var config = {
        conditions: {
          name: 'abc',
          age: 10
        },
        options: {
          populate: 'articles'
        }
      }
      query.findOne(config, function (err, record) {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        record.articles.length.should.equal(1)
        findOneUserId = record._id
        done()
      })
    })

    it('post - must create proper post route and updateReference ', function (done) {
            // config to pass router find method
      var config = {
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
      var data = {
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
                .end(function (err, res) {
                  res.body.name.should.equal('test article')
                  done(err) // pass err so that fail expect errors will get caught
                })
    })

        // verify that the article reference properly got inserted
    afterEach(function (done) {
      var query = new Query(db.getModel('User'))
            // unique identifier to find data
      var config = {
        conditions: {
          '_id': findOneUserId
        },
        options: {
          populate: 'articles'
        }
      }

      query.findOne(config, function (err, record) {
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

  describe('update Ref - must add record the update location reference', function () {
    var findOneUserId

        // use this to retrive the findOneUserId
    beforeEach(function (done) {
      var query = new Query(db.getModel('User'))
            // unique identifier to find data
      var config = {
        conditions: {
          name: 'abc',
          age: 10
        }
      }
      query.findOne(config, function (err, record) {
        if (err) {
          throw err
        }
        record.name.should.equal('abc')
        findOneUserId = record._id
        done()
      })
    })

    it('post - must create proper post route and updateReference ', function (done) {
            // config to pass router find method
      var config = {
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
      var data = {
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
                .end(function (err, res) {
                  res.body.streetOne.should.equal('250 Main St')
                  done(err) // pass err so that fail expect errors will get caught
                })
    })

        // verify that the article reference properly got inserted
    afterEach(function (done) {
      var query = new Query(db.getModel('User'))
            // unique identifier to find data
      var config = {
        conditions: {
          '_id': findOneUserId
        },
        options: {
          populate: 'location'
        }
      }

      query.findOne(config, function (err, record) {
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
