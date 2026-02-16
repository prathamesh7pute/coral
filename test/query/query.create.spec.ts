/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import should from 'should'
import { afterAll, beforeAll, describe, it } from 'vitest'
import type { User } from '../helper/models.js'

describe('query create tests', () => {
  let query: Query<User>

  beforeAll(async () => {
    await db.connect()
    query = new Query(db.getModel('User'))
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  it('create - must create proper records if pass array of records', async () => {
    // data to insert
    const records = [{
      name: 'ghi',
      age: 27
    }, {
      name: 'pqr',
      age: 18
    }]

    // invoke query create method
    const docs = await query.create({ data: records })
    if (!docs || !Array.isArray(docs)) {
      throw new Error('Expected created records array')
    }
    docs[0].name.should.equal('ghi')
    docs[0].age.should.equal(27)
    docs[1].name.should.equal('pqr')
    docs[1].age.should.equal(18)
  })

  it('create - must create proper records if pass object', async () => {
    // data to insert
    const data = {
      name: 'pqr',
      age: 27
    }

    // invoke query create method
    const record = await query.create({}, data)
    if (!record || Array.isArray(record)) {
      throw new Error('Expected one created record')
    }
    record.name.should.equal('pqr')
    record.age.should.equal(27)
  })

  it('create - records should not exists if pass blank array', async () => {
    // data to insert
    const data = []

    // invoke query create method
    const records = await query.create({}, data)
    should.not.exist(records)
  })

  it('create - must create blank record if pass blank object', async () => {
    // data to insert
    const data = {}

    // invoke query create method
    const record = await query.create({}, data)
    if (!record || Array.isArray(record)) {
      throw new Error('Expected one created record')
    }
    should.not.exist(record.name)
    should.not.exist(record.age)
  })

  it('create - must throw error with improper email address', async () => {
    // data to insert
    const records = {
      name: 'xyz',
      age: 27,
      email: 'xyz.com' // pass invalid email address
    }

    // invoke query create method
    let thrown: unknown
    try {
      await query.create({}, records)
    } catch (err) {
      thrown = err
    }

    const error = thrown as { errors: { email: { message: string } } }
    error.errors.email.message.should.equal('Invalid email address')
  })
})
