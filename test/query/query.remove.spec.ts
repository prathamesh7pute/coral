/**
 * Test dependencies.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Query from '../../src/query';
import db from '../helper/db';

describe('query findOneAndRemove tests', () => {
  let query: Query;

  beforeAll(async () => {
    await db.connect();
    query = new Query(db.getModel('User'));
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('findOneAndRemove - must remove proper record', async () => {
    // identifier to remove the specific record
    const config = {
      conditions: {
        name: 'abc',
      },
    };

    // invoke findOne and remove
    const record = await query.findOneAndRemove(config);
    expect(record).toBeDefined();
  });
});
