/**
 * Test dependencies.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Query from '../../src/query';
import db from '../helper/db';
import {
  getPopulatedStringField,
  getQueryDocument,
  getQueryValueArray,
} from '../helper/queryAccessors';

describe('query findOne tests', () => {
  let query: Query;

  beforeAll(async () => {
    await db.connect();
    query = new Query(db.getModel('User'));
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('findOne - must return exact available record when call with name identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
      },
    };

    const record = getQueryDocument(await query.findOne(config));
    expect(record.name).toBe('abc');
  });

  it('findOne - must return available record when call with multiple identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
        age: 10,
      },
    };

    const record = getQueryDocument(await query.findOne(config));
    expect(record.name).toBe('abc');
  });

  it('findOne - must return exact record with only selected values when call with name identifier', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
      },
      fields: 'name',
    };

    const record = getQueryDocument(await query.findOne(config));
    expect(record.name).toBe('abc');
    expect(record.age).toBeUndefined();
  });

  it('findOne - must return exact record with only selected values and populated articles', async () => {
    // unique identifier to find data
    const config = {
      conditions: {
        name: 'abc',
      },
      fields: 'name articles',
      options: {
        populate: 'articles',
      },
    };

    const record = getQueryDocument(await query.findOne(config));
    expect(record.name).toBe('abc');
    const articles = getQueryValueArray(record.articles, 'Expected articles array');
    const article = getPopulatedStringField(articles[0], 'title', 'article');
    expect(article.title).toBe('Article One');
    expect(record.age).toBeUndefined();
  });
});
