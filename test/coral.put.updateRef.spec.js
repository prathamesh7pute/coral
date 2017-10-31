/**
 * Test dependencies.
 */
var Coral = require('../lib/coral')
var Query = require('../lib/query')
var db = require('./helper/db')
var express = require('express')
var should = require('should')
var request = require('supertest')
var bodyParser = require('body-parser')
var app = express()

describe('Coral put  updateRef tests', function () {
    // require to get req body parameters
  app.use(bodyParser.json())

  beforeEach(function (done) {
    db.connect()
    db.initialise(done)
  })

  afterEach(function (done) {
    db.disconnect(done)
  })

  describe('update Ref - must update record and should not push new article reference', function () {
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

    it('put - must create proper post route and updateReference ', function (done) {
            // config to pass router find method
      var config = {
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
      var data = {
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
                .end(function (err, res) {
                  res.body.name.should.equal('test article 1')
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
        record.articles.length.should.equal(1)
        record.articles[0].name.should.equal('article-one')
        done()
      })
    })
  })

  describe('update Ref - must update record and should not update location reference', function () {
    var findOneUserId

        // use this to retrive the findOneUserId
    beforeEach(function (done) {
      var query = new Query(db.getModel('User'))
      var locationQuery = new Query(db.getModel('Location'))
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

                // data to insert
        var data = {
          streetOne: 'buckland'
        }
                // invoke query create method
        locationQuery.create({}, data, function (err, record) {
          if (err) {
            throw err
          }
          record.streetOne.should.equal('buckland')
          done()
        })
      })
    })

    it('put - must create proper put route and and should not updateReference ', function (done) {
            // config to pass router find method
      var config = {
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
      var data = {
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
                .end(function (err, res) {
                  res.body.streetOne.should.equal('345 Buckland Hills Dr')
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
        should.not.exist(record.location)
        done()
      })
    })
  })
})
