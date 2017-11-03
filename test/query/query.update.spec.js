/**
 * Test dependencies.
 */
const Query = require('../../lib/query')
const db = require('../helper/db')

describe('query findOneAndUpdate tests', () => {
  let query

  before((done) => {
    db.connect()
    query = new Query(db.getModel('User'))
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('findOneAndUpdate - must update proper record', (done) => {
    // update data
    const data = {
      name: 'pqr'
    }

    // identifier to update the specific record
    const config = {
      conditions: {
        name: 'abc'
      }
    }

    // invoke findOne and update
    query.findOneAndUpdate(config, data, (err, record) => {
      if (err) {
        throw err
      }
      // name should get modify from abc to Ryan
      record.name.should.equal('pqr')
      // age should not chage
      record.age.should.equal(10)
      done()
    })
  })
})
