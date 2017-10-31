/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery')
var db = require('./helper/db')
var should = require('should')

describe('subDocQuery remove tests', function () {
  var subDocQuery

  before(function () {
    db.connect()
    subDocQuery = new SubDocQuery(db.getModel('Article'))
  })

  after(function (done) {
    db.disconnect(done)
  })

  beforeEach(function (done) {
    db.initialise(done)
  })

  it('remove subDoc - must remove specific record', function (done) {
    var config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-one'
        }
      }
    }

    subDocQuery.findOneAndRemove(config, function (err) {
      should.not.exist(err)
      if (!err) {
        done()
      }
    })
  })

  it('remove subDoc subDoc - must remove specific record', function (done) {
    var config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two'
        },
        subDoc: {
          path: 'replies',
          conditions: {
            name: 'reply-two'
          }
        }
      }
    }

    subDocQuery.findOneAndRemove(config, function (err) {
      should.not.exist(err)
      if (!err) {
        done()
      }
    })
  })
})
