/**
 * Test dependencies.
 */
const Query = require('../../lib/query')
const db = require('../helper/db')
const should = require('should')

describe('query create tests', () => {
  let query

  before((done) => {
    db.connect()
    query = new Query(db.getModel('User'))
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('create - must create proper records if pass array of records', (done) => {
    // data to insert
    const records = [{
      name: 'ghi',
      age: 27
    }, {
      name: 'pqr',
      age: 18
    }]

    // invoke query create method
    query.create({ data: records }, {}, (err, docs) => {
      if (err) {
        throw err
      }
      docs[0].name.should.equal('ghi')
      docs[0].age.should.equal(27)
      docs[1].name.should.equal('pqr')
      docs[1].age.should.equal(18)
      done()
    })
  })

  it('create - must create proper records if pass object', (done) => {
    // data to insert
    const data = {
      name: 'pqr',
      age: 27
    }

    // invoke query create method
    query.create({}, data, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('pqr')
      record.age.should.equal(27)
      done()
    })
  })

  it('create - records should not exists if pass blank array', (done) => {
    // data to insert
    const data = []

    // invoke query create method
    query.create({}, data, (err, records) => {
      if (err) {
        throw err
      }
      should.not.exist(records)
      done()
    })
  })

  it('create - must create blank record if pass blank object', (done) => {
    // data to insert
    const data = {}

    // invoke query create method
    query.create({}, data, (err, record) => {
      if (err) {
        throw err
      }
      should.not.exist(record.name)
      should.not.exist(record.age)
      done()
    })
  })

  it('create - must throw error with improper email address', (done) => {
    // data to insert
    const records = {
      name: 'xyz',
      age: 27,
      email: 'xyz.com' // pass invalid email address
    }

    // invoke query create method
    query.create({}, records, (err, record) => {
      err.errors.email.message.should.equal('Invalid email address')
      done()
    })
  })
})
