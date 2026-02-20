/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import db from '../helper/db';

const app = express();

describe('Coral put tests', () => {
  // require to get req body parameters
  app.use(express.json());

  beforeAll(async () => {
    await db.connect();
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('put - must create proper put route and update matching record', async () => {
    // config for route
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name',
      methods: ['PUT'],
    };

    // data to be pass to update data
    const data = {
      name: 'test',
      age: 40,
    };

    // call router put with the config
    app.use(Coral(config));

    // invoke path with supertest
    const res = await request(app)
      .put(`${config.path}/abc`)
      .set('accept', 'application/json')
      .send(data)
      .expect(200);
    expect(res.body.name).toBe('test');
    expect(res.body.age).toBe(40);
  });
});
