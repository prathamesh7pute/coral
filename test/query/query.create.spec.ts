/**
 * Test dependencies.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Query from '../../src/query';
import db from '../helper/db';
import { getQueryDocument, getQueryDocuments, getRecordAtIndex } from '../helper/queryAccessors';

describe('query create tests', () => {
  let query: Query;

  beforeAll(async () => {
    await db.connect();
    query = new Query(db.getModel('User'));
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('create - must create proper records if pass array of records', async () => {
    // data to insert
    const records = [
      {
        name: 'ghi',
        age: 27,
      },
      {
        name: 'pqr',
        age: 18,
      },
    ];

    // invoke query create method
    const docs = getQueryDocuments(
      await query.create({ data: records }),
      'Expected created records array',
    );
    const firstDoc = getRecordAtIndex(docs, 0);
    const secondDoc = getRecordAtIndex(docs, 1);
    expect(firstDoc.name).toBe('ghi');
    expect(firstDoc.age).toBe(27);
    expect(secondDoc.name).toBe('pqr');
    expect(secondDoc.age).toBe(18);
  });

  it('create - must create proper records if pass object', async () => {
    // data to insert
    const data = {
      name: 'pqr',
      age: 27,
    };

    // invoke query create method
    const record = getQueryDocument(await query.create({}, data), 'Expected one created record');
    expect(record.name).toBe('pqr');
    expect(record.age).toBe(27);
  });

  it('create - records should not exists if pass blank array', async () => {
    // data to insert
    const data: Array<Record<string, never>> = [];

    // invoke query create method
    const records = await query.create({}, data);
    expect(records).toBeUndefined();
  });

  it('create - must create blank record if pass blank object', async () => {
    // data to insert
    const data = {};

    // invoke query create method
    const record = getQueryDocument(await query.create({}, data), 'Expected one created record');
    expect(record.name).toBeUndefined();
    expect(record.age).toBeUndefined();
  });

  it('create - must throw error with improper email address', async () => {
    // data to insert
    const records = {
      name: 'xyz',
      age: 27,
      email: 'xyz.com', // pass invalid email address
    };

    // invoke query create method
    let thrown:
      | {
          errors: { email: { message: string } };
        }
      | undefined;
    try {
      await query.create({}, records);
    } catch (err) {
      if (err && typeof err === 'object' && 'errors' in err) {
        thrown = err as { errors: { email: { message: string } } };
      }
    }

    if (!thrown) {
      throw new Error('Expected validation error');
    }
    expect(thrown.errors.email.message).toBe('Invalid email address');
  });
});
