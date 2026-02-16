/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest'
import type { Article } from '../helper/models.js'

describe('subDocQuery remove tests', () => {
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

  it('remove subDoc - must remove specific record', async () => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-one'
        }
      }
    }

    const result = await subDocQuery.findOneAndRemove(config)
    expect(result).toBeNull()
  })

  it('remove subDoc subDoc - must remove specific record', async () => {
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

    const result = await subDocQuery.findOneAndRemove(config)
    expect(result).toBeNull()
  })
})
