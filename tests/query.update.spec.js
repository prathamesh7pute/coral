/**
 * Test dependencies.
 */
var Query = require('../lib/query')
var db = require('./helper/db')

describe('query findOneAndUpdate tests', function () {
  var query

  before(function (done) {
    db.connect()
    query = new Query(db.getModel('User'))
    db.initialise(done)
  })

  after(function (done) {
    db.disconnect(done)
  })

  it('findOneAndUpdate - must update proper record', function (done) {
    // update data
    var data = {
      name: 'pqr'
    }

    // identifier to update the specific record
    var config = {
      conditions: {
        name: 'abc'
      }
    }

    // invoke findOne and update
    query.findOneAndUpdate(config, data, function (err, record) {
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
