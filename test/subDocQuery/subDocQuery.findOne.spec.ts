/**
 * Test dependencies.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import SubDocQuery from '../../src/subDocQuery';
import db from '../helper/db';
import { getSubDocRecord } from '../helper/queryAccessors';

describe('subDocQuery findOne tests', () => {
  let subDocQuery: SubDocQuery;

  beforeAll(async () => {
    await db.connect();
    subDocQuery = new SubDocQuery(db.getModel('Article'));
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.initialise();
  });

  it('findOne subDoc - must return one specific available record', async () => {
    const config = {
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-one',
        },
      },
    };

    const record = getSubDocRecord(await subDocQuery.findOne(config));
    expect(record.name).toBe('comment-one');
    expect(record.body).toBe('Article One First Comment');
  });

  it('findOne subDoc subDoc - must return one specific available record', async () => {
    const config = {
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two',
        },
        subDoc: {
          path: 'replies',
          conditions: {
            name: 'reply-two',
          },
        },
      },
    };

    const record = getSubDocRecord(await subDocQuery.findOne(config));
    expect(record.name).toBe('reply-two');
    expect(record.body).toBe('Article One Second Comment Second Reply');
  });
});
