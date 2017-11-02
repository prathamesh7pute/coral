/**
 * Test dependencies.
 */
const SubDocQuery = require('../../lib/subDocQuery')
const db = require('../helper/db')
const should = require('should')

describe('subDocQuery create tests', () => {
  let subDocQuery

  before(() => {
    db.connect()
    subDocQuery = new SubDocQuery(db.getModel('Article'))
  })

  after((done) => {
    db.disconnect(done)
  })

  beforeEach((done) => {
    db.initialise(done)
  })

  it('create subDoc - must create record with data passed', (done) => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    }

    const data = {
      'name': 'comment-three',
      'body': 'Article One Third Comment',
      'replies': [{
        'name': 'reply-one',
        'body': 'Article One Third Comment First Reply'
      }]
    }

    subDocQuery.create(config, data, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('comment-three')
      should.exist(record._id)
      done()
    })
  })

  it('create subDoc subDoc - must create record with data passed', (done) => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two'
        },
        subDoc: {
          path: 'replies'
        }
      }
    }

    const data = {
      'name': 'reply-three',
      'body': 'Article One Second Comment Third Reply'
    }

    subDocQuery.create(config, data, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('reply-three')
      should.exist(record._id)
      done()
    })
  })
})
