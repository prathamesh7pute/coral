/**
 * Test dependencies.
 */
const Query = require('../../lib/query')
const db = require('../helper/db')
const should = require('should')

describe('query findOne tests', () => {
  let query

  before((done) => {
    db.connect()
    query = new Query(db.getModel('User'))
    db.initialise(done)
  })

  after((done) => {
    db.disconnect(done)
  })

  it('findOne - must return exact available record when call with name identifier', (done) => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc'
      }
    }

    query.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('abc')
      done()
    })
  })

  it('findOne - must return available record when call with multiple identifier', (done) => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
        age: 10
      }
    }

    query.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('abc')
      done()
    })
  })

  it('findOne - must return exact record with only selected values when call with name identifier', (done) => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc'
      },
      fields: 'name'
    }

    query.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('abc')
      should.not.exist(record.age)
      done()
    })
  })

  it('findOne - must return exact record with only selected values and populated articles', (done) => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc'
      },
      fields: 'name articles',
      options: {
        populate: 'articles'
      }
    }

    query.findOne(config, (err, record) => {
      if (err) {
        throw err
      }
      record.name.should.equal('abc')
      record.articles[0].title.should.equal('Article One')
      should.not.exist(record.age)
      done()
    })
  })
})
