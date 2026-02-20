/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import db from '../helper/db';

describe('Coral query tests', () => {
  let app: express.Express;

  beforeEach(async () => {
    await db.connect();
    app = express();
    await db.initialise();
  });

  afterEach(async () => {
    await db.disconnect();
  });

  it('coral query - must create proper routes and return results according to query provided', async () => {
    // config to pass
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        conditions: {
          age: {
            $lte: 20,
          },
          name: {
            $in: ['abc', 'xyz'],
          },
        },
        fields: 'name age -_id',
        options: {
          skip: 0,
          limit: 10,
          sort: 'name',
        },
      },
    };

    // call coral router with the config
    app.use(Coral(config));

    // invoke path with supertest
    const res = await request(app).get(config.path).set('accept', 'application/json').expect(200);

    const records = res.body;
    expect(records).toHaveLength(1);
    expect(records[0].name).toBeDefined();
    expect(records[0].age).toBeDefined();
    expect(records[0]._id).toBeUndefined();
  });

  it('coral query - must return sorted records with overrrided parameters from routes', async () => {
    // config to pass
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      query: {
        options: {
          sort: '-name',
        },
      },
    };

    // call coral router with the config
    app.use(Coral(config));

    // invoke path with supertest
    const res = await request(app)
      .get(config.path)
      .set('accept', 'application/json')
      .query({
        sort: 'name',
      })
      .expect(200);

    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('xyz');
    expect(res.body[1].name).toBe('def');
    expect(res.body[2].name).toBe('abc');
  });
});
