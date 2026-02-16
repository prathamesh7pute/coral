/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import should from 'should'
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest'

describe('subDocQuery remove tests', () => {
  let subDocQuery: SubDocQuery

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
    should.not.exist(result)
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
    should.not.exist(result)
  })
})
