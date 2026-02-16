/**
 * Test dependencies.
 */
import Query from '../../src/query.js'
import db from '../helper/db.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Article, User } from '../helper/models.js'

describe('query findOne tests', () => {
  let query: Query<User>

  beforeAll(async () => {
    await db.connect()
    query = new Query(db.getModel('User'))
    await db.initialise()
  })

  afterAll(async () => {
    await db.disconnect()
  })

  it('findOne - must return exact available record when call with name identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc'
      }
    }

    const record = await query.findOne(config)
    if (!record) throw new Error('Expected one record')
    expect(record.name).toBe('abc')
  })

  it('findOne - must return available record when call with multiple identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
        age: 10
      }
    }

    const record = await query.findOne(config)
    if (!record) throw new Error('Expected one record')
    expect(record.name).toBe('abc')
  })

  it('findOne - must return exact record with only selected values when call with name identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc'
      },
      fields: 'name'
    }

    const record = await query.findOne(config)
    if (!record) throw new Error('Expected one record')
    expect(record.name).toBe('abc')
    expect(record.age).toBeUndefined()
  })

  it('findOne - must return exact record with only selected values and populated articles', async () => {
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

    const record = await query.findOne(config)
    if (!record) throw new Error('Expected one record')
    expect(record.name).toBe('abc')
    expect((record.articles[0] as unknown as Article).title).toBe('Article One')
    expect(record.age).toBeUndefined()
  })
})
