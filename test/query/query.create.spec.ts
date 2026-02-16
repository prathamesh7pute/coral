/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
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
    expect(docs[0].name).toBe('ghi')
    expect(docs[0].age).toBe(27)
    expect(docs[1].name).toBe('pqr')
    expect(docs[1].age).toBe(18)
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
    expect(record.name).toBe('pqr')
    expect(record.age).toBe(27)
  })

  it('create - records should not exists if pass blank array', async () => {
    // data to insert
    const data: Record<string, unknown>[] = []

    // invoke query create method
    const records = await query.create({}, data)
    expect(records).toBeUndefined()
  })

  it('create - must create blank record if pass blank object', async () => {
    // data to insert
    const data = {}

    // invoke query create method
    const record = await query.create({}, data)
    if (!record || Array.isArray(record)) {
      throw new Error('Expected one created record')
    }
    expect(record.name).toBeUndefined()
    expect(record.age).toBeUndefined()
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
    expect(error.errors.email.message).toBe('Invalid email address')
  })
})
