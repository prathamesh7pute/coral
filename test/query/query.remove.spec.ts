/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import should from 'should'
import { afterAll, beforeAll, describe, it } from 'vitest'
import type { User } from '../helper/models.js'

describe('query findOneAndRemove tests', () => {
  let query: Query<User>

  beforeAll(async () => {
    await db.connect()
    query = new Query(db.getModel('User'))
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  it('findOneAndRemove - must remove proper record', async () => {
    // identifier to remove the specific record
    const config = {
      conditions: {
        name: 'abc'
      }
    }

    // invoke findOne and remove
    const record = await query.findOneAndRemove(config)
    should.exist(record)
  })
})
