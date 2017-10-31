/**
 * Test dependencies.
 */
var SubDocQuery = require('../lib/subDocQuery')
var db = require('./helper/db')
var should = require('should')

describe('subDocQuery update tests', function () {
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

  it('update subDoc - must update record with chnaged value', function (done) {
    var config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two'
        }
      }
    }

    var data = {
      'body': 'Article One Second Comment - modified'
    }

    subDocQuery.findOneAndUpdate(config, data, function (err, record) {
      if (err) {
        throw err
      }
      record.name.should.equal('comment-two')
      record.body.should.equal('Article One Second Comment - modified')
      should.exist(record._id)
      done()
    })
  })

  it('update subDoc subDoc - must update record with chnaged value', function (done) {
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

    var data = {
      'body': 'Article One Second Comment Second Reply - modified'
    }

    subDocQuery.findOneAndUpdate(config, data, function (err, record) {
      if (err) {
        throw err
      }
      record.name.should.equal('reply-two')
      record.body.should.equal('Article One Second Comment Second Reply - modified')
      should.exist(record._id)
      done()
    })
  })
})
