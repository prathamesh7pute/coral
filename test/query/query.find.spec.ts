/**
 * Test dependencies.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Query from '../../src/query';
import db from '../helper/db';
import {
  getPopulatedStringField,
  getQueryDocuments,
  getQueryValueArray,
  getRecordAtIndex,
} from '../helper/queryAccessors';

describe('query find tests', () => {
  let query: Query;

  beforeAll(async () => {
    await db.connect();
    query = new Query(db.getModel('User'));
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.initialise();
  });

  it('find - must return all available records', async () => {
    // query config
    const config = {};

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(3);
  });

  it('find - must return all available records with sort and in descending order', async () => {
    // query config
    const config = {
      options: {
        sort: '-name',
        skip: 0,
        limit: 3,
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(3);
    expect(getRecordAtIndex(records, 0).name).toBe('xyz');
    expect(getRecordAtIndex(records, 1).name).toBe('def');
    expect(getRecordAtIndex(records, 2).name).toBe('abc');
  });

  it('find - must return all available records with sort, in ascending order and limit of 2', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 2,
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(2);
    expect(getRecordAtIndex(records, 0).name).toBe('abc');
    expect(getRecordAtIndex(records, 1).name).toBe('def');
  });

  it('find - must return all records with asc sort order with skip first record and limit of 2', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 2,
        limit: 1,
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(1);
    expect(getRecordAtIndex(records, 0).name).toBe('xyz');
  });

  it('find - must return all available records with select of age only', async () => {
    // query config
    const config = {
      fields: '-name -_id -articles',
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(3);
    const firstRecord = getRecordAtIndex(records, 0);
    expect(firstRecord.age).toBeDefined();
    expect((firstRecord as { names?: string }).names).toBeUndefined();
  });

  it('find - must return all records with sort, filters, skip and limit', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 10,
      },
      conditions: {
        age: {
          $lte: 20,
        },
        name: {
          $in: ['abc', 'xyz'],
        },
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(1);
  });

  it('find - must return specific records available records with article populated', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        skip: 0,
        limit: 1,
        populate: 'articles',
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(1);
    const firstRecord = getRecordAtIndex(records, 0);
    expect(firstRecord.name).toBe('abc');
    const articles = getQueryValueArray(firstRecord.articles, 'Expected articles array');
    const article = getPopulatedStringField(articles[0], 'title', 'article');
    expect(article.title).toBe('Article One');
  });

  it('find - must return all records available records with article populated', async () => {
    // query config
    const config = {
      options: {
        sort: 'name',
        populate: [{ path: 'articles location' }],
      },
    };

    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(3);
    const firstRecord = getRecordAtIndex(records, 0);
    expect(firstRecord.name).toBe('abc');
    const articles = getQueryValueArray(firstRecord.articles, 'Expected articles array');
    const article = getPopulatedStringField(articles[0], 'title', 'article');
    expect(article.title).toBe('Article One');
  });

  it('find - must return zero records for empty collection', async () => {
    // find config on the query
    const config = {};

    // remove all the records first
    await db.removeRecords();

    // once removed all records call the find query now
    const records = getQueryDocuments(await query.find(config));
    expect(records).toHaveLength(0);
  });
});
