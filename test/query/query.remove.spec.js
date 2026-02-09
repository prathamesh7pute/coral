/**
 * Test dependencies.
 */
import Query from '../../lib/query.js'
import db from '../helper/db.js'
import should from 'should'

describe('query findOneAndRemove tests', () => {
  let query

  before((done) => {
    db.connect()
    query = new Query(db.getModel('User'))
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('findOneAndRemove - must remove proper record', (done) => {
    // identifier to remove the specific record
    const config = {
      conditions: {
        name: 'abc'
      }
    }

    // invoke findOne and remove
    query.findOneAndRemove(config, (err) => {
      should.not.exist(err)
      if (!err) {
        done()
      }
    })
  })
})
