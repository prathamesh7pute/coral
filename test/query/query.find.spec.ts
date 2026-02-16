/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import should from 'should'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import type { Article, User } from '../helper/models.js'

describe('query find tests', () => {
  let query: Query<User>

  beforeAll(async () => {
    await db.connect()
    query = new Query(db.getModel('User'))
  })

  afterAll(async () => {
    await db.disconnect()
  })

  beforeEach(async () => {
    await db.initialise()
  })

  it('find - must return all available records', async () => {
    // query config
    const config = {}

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(3)
  })

  it('find - must return all available records with sort and in descending order', async () => {
    // query config
    const config = {
      options: {
        sort: '-name',
        skip: 0,
        limit: 3
      }
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(3)
    records[0].name.should.equal('xyz')
    records[1].name.should.equal('def')
    records[2].name.should.equal('abc')
  })

  it('find - must return all available records with sort, in ascending order and limit of 2', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 2
      }
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(2)
    records[0].name.should.equal('abc')
    records[1].name.should.equal('def')
  })

  it('find - must return all records with asc sort order with skip first record and limit of 2', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 2,
        limit: 1
      }
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(1)
    records[0].name.should.equal('xyz')
  })

  it('find - must return all available records with select of age only', async () => {
    // query config
    const config = {
      fields: '-name -_id -articles'
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(3)
    should.exist(records[0].age)
    should.not.exist((records[0] as unknown as Record<string, unknown>).names)
  })

  it('find - must return all records with sort, filters, skip and limit', async () => {
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

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(1)
  })

  it('find - must return specific records available records with article populated', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 1,
        populate: 'articles'
      }
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(1)
    records[0].name.should.equal('abc')
    ;(records[0].articles[0] as unknown as Article).title.should.equal('Article One')
  })

  it('find - must return all records available records with article populated', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        populate: [{ path: 'articles location' }]
      }
    }

    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(3)
    records[0].name.should.equal('abc')
    ;(records[0].articles[0] as unknown as Article).title.should.equal('Article One')
  })

  it('find - must return zero records for empty collection', async () => {
    // find config on the query
    const config = {}

    // remove all the records first
    await db.removeRecords()

    // once removed all records call the find query now
    const records = await query.find(config)
    if (!records) throw new Error('Expected records')
    records.length.should.equal(0)
  })
})
