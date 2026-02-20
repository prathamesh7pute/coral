/**
 * Test dependencies.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Query from '../../src/query';
import db from '../helper/db';
import { getQueryDocument } from '../helper/queryAccessors';

describe('query findOneAndUpdate tests', () => {
  let query: Query;

  beforeAll(async () => {
    await db.connect();
    query = new Query(db.getModel('User'));
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('findOneAndUpdate - must update proper record', async () => {
    // update data
    const data = {
      name: 'pqr',
    };

    // identifier to update the specific record
    const config = {
      conditions: {
        name: 'abc',
      },
    };

    // invoke findOne and update
    const record = getQueryDocument(
      await query.findOneAndUpdate(config, data),
      'Expected one updated record',
    );
    // name should get modify from abc to Ryan
    expect(record.name).toBe('pqr');
    expect(record.age).toBe(10);
  });
});
