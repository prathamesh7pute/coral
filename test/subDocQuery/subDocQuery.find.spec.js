/**
 * Test dependencies.
 */
const SubDocQuery = require('../../lib/subDocQuery')
const db = require('../helper/db')

describe('subDocQuery find tests', () => {
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

  it('find subDoc - must return all available records', (done) => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    }

    subDocQuery.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(2)
      done()
    })
  })

  it('find subDoc subDoc - must return all available records', (done) => {
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

    subDocQuery.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(2)
      done()
    })
  })
})
