/**
 * Test dependencies.
 */

import express, { type Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';
import Coral from '../../src/coral';
import type { CoralConfig } from '../../src/models/index.ts';
import db from '../helper/db';

describe('Coral methods tests', () => {
  beforeAll(async () => {
    await db.connect();
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('no methods - must create all required routes', () => {
    let config: CoralConfig;
    let app: Express;

    beforeAll(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
      };
      app = express();
      app.use(Coral(config));
    });

    // without idAttributes
    it('get - must create proper get route', async () => {
      await request(app).get(config.path).expect(200);
    });

    it('post - must create proper post route', async () => {
      await request(app).post(config.path).expect(200);
    });

    it('put - must create proper put route', async () => {
      await request(app).put(config.path).expect(404);
    });

    it('del - must create proper del route', async () => {
      await request(app).del(config.path).expect(404);
    });

    // with idAttributes
    it('get - must create proper get route with idAttribute', async () => {
      await request(app).get(`${config.path}/abc`).expect(200);
    });

    it('post - must create proper post route with idAttribute', async () => {
      await request(app).post(`${config.path}/abc`).expect(404);
    });

    it('put - must create proper put route with idAttribute', async () => {
      await request(app).put(`${config.path}/abc`).expect(200);
    });

    it('del - must create proper del route with idAttribute', async () => {
      await request(app).del(`${config.path}/abc`).expect(200);
    });
  });

  describe('get, put - must create only get, put route', () => {
    let config: CoralConfig;
    let app: Express;

    beforeAll(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['GET', 'PUT'],
      };
      app = express();
      app.use(Coral(config));
    });

    // without idAttributes
    it('get - must create proper get route', async () => {
      await request(app).get(config.path).expect(200);
    });

    it('post - must create proper post route', async () => {
      await request(app).post(config.path).expect(404);
    });

    it('put - must create proper put route', async () => {
      await request(app).put(config.path).expect(404);
    });

    it('del - must create proper del route', async () => {
      await request(app).del(config.path).expect(404);
    });

    // with idAttributes
    it('get - must create proper get route with idAttribute', async () => {
      await request(app).get(`${config.path}/abc`).expect(200);
    });

    it('post - must create proper post route with idAttribute', async () => {
      await request(app).post(`${config.path}/abc`).expect(404);
    });

    it('put - must create proper put route with idAttribute', async () => {
      await request(app).put(`${config.path}/abc`).expect(200);
    });

    it('del - must create proper del route with idAttribute', async () => {
      await request(app).del(`${config.path}/abc`).expect(404);
    });
  });

  describe('post, delete - must create only post, delete route', () => {
    let config: CoralConfig;
    let app: Express;

    beforeAll(() => {
      config = {
        path: '/localhost/user',
        idAttribute: 'name',
        model: db.getModel('User'),
        methods: ['POST', 'DELETE'],
      };
      app = express();
      app.use(Coral(config));
    });

    // without idAttributes
    it('get - must create proper get route', async () => {
      await request(app).get(config.path).expect(404);
    });

    it('post - must create proper post route', async () => {
      await request(app).post(config.path).expect(200);
    });

    it('put - must create proper put route', async () => {
      await request(app).put(config.path).expect(404);
    });

    it('del - must create proper del route', async () => {
      await request(app).del(config.path).expect(404);
    });

    // with idAttributes
    it('get - must create proper get route with idAttribute', async () => {
      await request(app).get(`${config.path}/abc`).expect(404);
    });

    it('post - must create proper post route with idAttribute', async () => {
      await request(app).post(`${config.path}/abc`).expect(404);
    });

    it('put - must create proper put route with idAttribute', async () => {
      await request(app).put(`${config.path}/abc`).expect(404);
    });

    it('del - must create proper del route with idAttribute', async () => {
      await request(app).del(`${config.path}/abc`).expect(200);
    });
  });
});
