/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest'
import type { Article } from '../helper/models.js'

describe('subDocQuery find tests', () => {
  let subDocQuery: SubDocQuery<Article>

  beforeAll(async () => {
    await db.connect()
    subDocQuery = new SubDocQuery(db.getModel('Article'))
  })

  afterAll(async () => {
    await db.disconnect()
  })

  beforeEach(async () => {
    await db.initialise()
  })

  it('find subDoc - must return all available records', async () => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    }

    const records = await subDocQuery.find(config) as Array<Record<string, unknown>>
    expect(records).toHaveLength(2)
  })

  it('find subDoc subDoc - must return all available records', async () => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two'
        },
        subDoc: {
          path: 'replies'
        }
      }
    }

    const records = await subDocQuery.find(config) as Array<Record<string, unknown>>
    expect(records).toHaveLength(2)
  })
})
