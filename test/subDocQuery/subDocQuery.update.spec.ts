/**
 * Test dependencies.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import SubDocQuery from '../../src/subDocQuery';
import db from '../helper/db';
import { getSubDocRecord } from '../helper/queryAccessors';

describe('subDocQuery update tests', () => {
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

  it('update subDoc - must update record with chnaged value', async () => {
    const config = {
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-two',
        },
      },
    };

    const data = {
      body: 'Article One Second Comment - modified',
    };

    const record = getSubDocRecord(await subDocQuery.findOneAndUpdate(config, data));
    expect(record.name).toBe('comment-two');
    expect(record.body).toBe('Article One Second Comment - modified');
    expect(record._id).toBeDefined();
  });

  it('update subDoc subDoc - must update record with chnaged value', async () => {
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

    const data = {
      body: 'Article One Second Comment Second Reply - modified',
    };

    const record = getSubDocRecord(await subDocQuery.findOneAndUpdate(config, data));
    expect(record.name).toBe('reply-two');
    expect(record.body).toBe('Article One Second Comment Second Reply - modified');
    expect(record._id).toBeDefined();
  });
});
