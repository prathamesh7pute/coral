/**
 * Test dependencies.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import SubDocQuery from '../../src/subDocQuery';
import db from '../helper/db';
import { getSubDocRecord } from '../helper/queryAccessors';

describe('subDocQuery create tests', () => {
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

  it('create subDoc - must create record with data passed', async () => {
    const config = {
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
      },
    };

    const data = {
      name: 'comment-three',
      body: 'Article One Third Comment',
      replies: [
        {
          name: 'reply-one',
          body: 'Article One Third Comment First Reply',
        },
      ],
    };

    const record = getSubDocRecord(await subDocQuery.create(config, data));
    expect(record.name).toBe('comment-three');
    expect(record._id).toBeDefined();
  });

  it('create subDoc subDoc - must create record with data passed', async () => {
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
        },
      },
    };

    const data = {
      name: 'reply-three',
      body: 'Article One Second Comment Third Reply',
    };

    const record = getSubDocRecord(await subDocQuery.create(config, data));
    expect(record.name).toBe('reply-three');
    expect(record._id).toBeDefined();
  });
});
