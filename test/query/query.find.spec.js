/**
 * Test dependencies.
 */
const Query = require('../../lib/query')
const db = require('../helper/db')
const should = require('should')

describe('query find tests', () => {
  let query

  before(() => {
    db.connect()
    query = new Query(db.getModel('User'))
  })

  after((done) => {
    db.disconnect(done)
  })

  beforeEach((done) => {
    db.initialise(done)
  })

  it('find - must return all available records', (done) => {
    // query config
    const config = {}

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(3)
      done()
    })
  })

  it('find - must return all available records with sort and in descending order', (done) => {
    // query config
    const config = {
      options: {
        sort: '-name',
        skip: 0,
        limit: 3
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(3)
      records[0].name.should.equal('xyz')
      records[1].name.should.equal('def')
      records[2].name.should.equal('abc')
      done()
    })
  })

  it('find - must return all available records with sort, in ascending order and limit of 2', (done) => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 2
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(2)
      records[0].name.should.equal('abc')
      records[1].name.should.equal('def')
      done()
    })
  })

  it('find - must return all records with asc sort order with skip first record and limit of 2', (done) => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 2,
        limit: 1
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(1)
      records[0].name.should.equal('xyz')
      done()
    })
  })

  it('find - must return all available records with select of age only', (done) => {
    // query config
    const config = {
      fields: '-name -_id -articles'
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(3)
      should.exist(records[0].age)
      should.not.exist(records[0].names)
      done()
    })
  })

  it('find - must return all records with sort, filters, skip and limit', (done) => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 10
      },
      conditions: {
        age: {
          $lte: 20
        },
        name: {
          $in: ['abc', 'xyz']
        }
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(1)
      done()
    })
  })

  it('find - must return specific records available records with article populated', (done) => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 1,
        populate: 'articles'
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(1)
      records[0].name.should.equal('abc')
      records[0].articles[0].title.should.equal('Article One')
      done()
    })
  })

  it('find - must return all records available records with article populated', (done) => {
    // query config
    const config = {
      options: {
        sort: 'name',
        populate: [{ path: 'articles location' }]
      }
    }

    query.find(config, (err, records) => {
      if (err) {
        throw err
      }
      records.length.should.equal(3)
      records[0].name.should.equal('abc')
      records[0].articles[0].title.should.equal('Article One')
      done()
    })
  })

  it('find - must return zero records for empty collection', (done) => {
    // find config on the query
    const config = {}

    // remove all the records first
    db.removeRecords((err, records) => {
      if (err) {
        throw err
      }
      // once removed all records call the find query now
      query.find(config, (err, records) => {
        if (err) {
          throw err
        }
        records.length.should.equal(0)
        done()
      })
    })
  })
})
