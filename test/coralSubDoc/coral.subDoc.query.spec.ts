/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import type { CoralConfig } from '../../src/models/index.ts';
import db from '../helper/db';

describe('Coral subDoc query tests', () => {
  beforeAll(async () => {
    await db.connect();
    await db.initialise();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe('Coral subDoc query config', () => {
    let app: express.Express;
    let config: CoralConfig;

    beforeAll(() => {});

    it('subDoc query - must create proper get route return all records if no queries provided', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:name/comments',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'name',
        subDoc: {
          path: 'comments',
        },
      };

      app = express();
      // call router get with the config
      app.use(Coral(config));

      // invoke path with supertest
      const res = await request(app)
        .get('/localhost/articles/article-one/comments')
        .set('accept', 'application/json')
        .expect(200);
      expect(res.body).toHaveLength(2);
    });

    it('subDoc query - must create proper get route return sorted records if sort query provided', async () => {
      // config to pass router find method
      config = {
        path: '/localhost/articles/:articleName/comments/:commentName/replies',
        model: db.getModel('Article'),
        methods: ['GET'],
        idAttribute: 'name',
        idParam: 'articleName',
        subDoc: {
          path: 'comments',
          idAttribute: 'name',
          idParam: 'commentName',
          subDoc: {
            path: 'replies',
          },
        },
      };

      app = express();
      // call router get with the config
      app.use(Coral(config));

      // invoke path with supertest
      const res = await request(app)
        .get('/localhost/articles/article-one/comments/comment-one/replies')
        .set('accept', 'application/json')
        .expect(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
