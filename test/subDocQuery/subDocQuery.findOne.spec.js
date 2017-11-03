/**
 * Test dependencies.
 */
const SubDocQuery = require('../../lib/subDocQuery')
const db = require('../helper/db')

describe('subDocQuery findOne tests', () => {
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

  it('findOne subDoc - must return one specific available record', (done) => {
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

    subDocQuery.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('comment-one')
      record.body.should.equal('Article One First Comment')
      done()
    })
  })

  it('findOne subDoc subDoc - must return one specific available record', (done) => {
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

    subDocQuery.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('reply-two')
      record.body.should.equal('Article One Second Comment Second Reply')
      done()
    })
  })
})
