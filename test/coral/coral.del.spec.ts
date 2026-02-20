/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';
import Coral from '../../src/coral';
import db from '../helper/db';

const app = express();

describe('Coral del tests', () => {
  beforeAll(async () => {
    await db.connect();
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('del - must create proper del route and remove matching record', async () => {
    // config for route
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name',
      methods: ['DELETE'],
    };

    // call router put with the config
    app.use(Coral(config));

    // invoke path with supertest
    await request(app).del(`${config.path}/abc`).set('accept', 'application/json').expect(200);
  });
});
