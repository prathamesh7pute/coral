/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import should from 'should'
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest'

describe('subDocQuery update tests', () => {
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
    record.name.should.equal('comment-two')
    record.body.should.equal('Article One Second Comment - modified')
    should.exist(record._id)
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
    record.name.should.equal('reply-two')
    record.body.should.equal('Article One Second Comment Second Reply - modified')
    should.exist(record._id)
  })
})
