/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest'

describe('subDocQuery findOne tests', () => {
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

  it('findOne subDoc - must return one specific available record', async () => {
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

    const record = await subDocQuery.findOne(config) as Record<string, unknown>
    record.name.should.equal('comment-one')
    record.body.should.equal('Article One First Comment')
  })

  it('findOne subDoc subDoc - must return one specific available record', async () => {
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

    const record = await subDocQuery.findOne(config) as Record<string, unknown>
    record.name.should.equal('reply-two')
    record.body.should.equal('Article One Second Comment Second Reply')
  })
})
