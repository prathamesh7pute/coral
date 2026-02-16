/**
 * Test dependencies.
 */
import SubDocQuery from '../../src/subDocQuery.js'
import db from '../helper/db.js'
import should from 'should'
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest'

describe('subDocQuery create tests', () => {
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

  it('create subDoc - must create record with data passed', async () => {
    const config = {
      conditions: {
        name: 'article-one'
      },
      subDoc: {
        path: 'comments'
      }
    }

    const data = {
      name: 'comment-three',
      body: 'Article One Third Comment',
      replies: [{
        name: 'reply-one',
        body: 'Article One Third Comment First Reply'
      }]
    }

    const record = await subDocQuery.create(config, data) as Record<string, unknown>
    record.name.should.equal('comment-three')
    should.exist(record._id)
  })

  it('create subDoc subDoc - must create record with data passed', async () => {
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

    const data = {
      name: 'reply-three',
      body: 'Article One Second Comment Third Reply'
    }

    const record = await subDocQuery.create(config, data) as Record<string, unknown>
    record.name.should.equal('reply-three')
    should.exist(record._id)
  })
})
