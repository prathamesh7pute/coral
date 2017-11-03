/**
 * Test dependencies.
 */
const SubDocQuery = require('../../lib/subDocQuery')
const db = require('../helper/db')
const should = require('should')

describe('subDocQuery remove tests', () => {
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

  it('remove subDoc - must remove specific record', (done) => {
    const config = {
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

    subDocQuery.findOneAndRemove(config, (err, doc) => {
      should.not.exist(err)
      if (!err) {
        done()
      }
    })
  })

  it('remove subDoc subDoc - must remove specific record', (done) => {
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
          path: 'replies',
          conditions: {
            name: 'reply-two'
          }
        }
      }
    }

    subDocQuery.findOneAndRemove(config, (err) => {
      should.not.exist(err)
      if (!err) {
        done()
      }
    })
  })
})
