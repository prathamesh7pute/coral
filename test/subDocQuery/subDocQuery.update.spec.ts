/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest'
import type { Article } from '../helper/models.js'

describe('subDocQuery update tests', () => {
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

  it('update subDoc - must update record with chnaged value', async () => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two'
        }
      }
    }

    const data = {
      body: 'Article One Second Comment - modified'
    }

    const record = await subDocQuery.findOneAndUpdate(config, data) as Record<string, unknown>
    expect(record.name).toBe('comment-two')
    expect(record.body).toBe('Article One Second Comment - modified')
    expect(record._id).toBeDefined()
  })

  it('update subDoc subDoc - must update record with chnaged value', async () => {
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
          path: 'replies',
          conditions: {
            name: 'reply-two'
          }
        }
      }
    }

    const data = {
      body: 'Article One Second Comment Second Reply - modified'
    }

    const record = await subDocQuery.findOneAndUpdate(config, data) as Record<string, unknown>
    expect(record.name).toBe('reply-two')
    expect(record.body).toBe('Article One Second Comment Second Reply - modified')
    expect(record._id).toBeDefined()
  })
})
