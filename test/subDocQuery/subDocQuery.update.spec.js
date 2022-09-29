/**
 * Test dependencies.
 */
const SubDocQuery = require('../../lib/subDocQuery')
const db = require('../helper/db')
const should = require('should')

describe('subDocQuery update tests', () => {
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

  it('update subDoc - must update record with chnaged value', (done) => {
    const config = {
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

    const data = {
      body: 'Article One Second Comment - modified'
    }

    subDocQuery.findOneAndUpdate(config, data, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('comment-two')
      record.body.should.equal('Article One Second Comment - modified')
      should.exist(record._id)
      done()
    })
  })

  it('update subDoc subDoc - must update record with chnaged value', (done) => {
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

    const data = {
      body: 'Article One Second Comment Second Reply - modified'
    }

    subDocQuery.findOneAndUpdate(config, data, (err, record) => {
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
