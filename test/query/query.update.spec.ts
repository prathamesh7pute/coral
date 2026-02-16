/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { User } from '../helper/models.js'

describe('query findOneAndUpdate tests', () => {
  let query: Query<User>

  beforeAll(async () => {
    await db.connect()
    query = new Query(db.getModel('User'))
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  it('findOneAndUpdate - must update proper record', async () => {
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
    const record = await query.findOneAndUpdate(config, data)
    if (!record) throw new Error('Expected one updated record')
    // name should get modify from abc to Ryan
    expect(record.name).toBe('pqr')
    expect(record.age).toBe(10)
  })
})
