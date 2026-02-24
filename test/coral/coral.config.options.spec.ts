/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Coral from '../../src/coral';
import db from '../helper/db';

describe('Coral config options tests', () => {
  let app: express.Express;

  beforeEach(async () => {
    await db.connect();
    await db.initialise();

    app = express();
    app.use(express.json());
  });

  afterEach(async () => {
    await db.disconnect();
  });

  it('path - should mount routes at the configured base path', async () => {
    const config = {
      path: '/custom/users',
      model: db.getModel('User'),
      methods: ['GET'],
    };

    app.use(Coral(config));

    await request(app).get(config.path).expect(200);
    await request(app).get('/localhost/user').expect(404);
  });

  it('model - should bind route handlers to the configured model', async () => {
    const config = {
      path: '/localhost/article',
      model: db.getModel('Article'),
      methods: ['GET'],
    };

    app.use(Coral(config));

    const res = await request(app).get(config.path).expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBeDefined();
  });

  it('middlewares - should execute middleware before route handlers', async () => {
    const middleware = vi.fn((_req, _res, next) => {
      next();
    });

    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      methods: ['GET'],
      middlewares: [middleware],
    };

    app.use(Coral(config));

    await request(app).get(config.path).expect(200);
    expect(middleware).toHaveBeenCalledTimes(1);
  });

  it('middlewares - should allow middleware to terminate request', async () => {
    const blockRequest = (_req: express.Request, res: express.Response) => {
      res.status(401).json({ message: 'Unauthorized' });
    };

    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      methods: ['GET'],
      middlewares: [blockRequest],
    };

    app.use(Coral(config));

    const res = await request(app).get(config.path).expect(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('bodyFilter - should persist only whitelisted fields on create and update', async () => {
    const User = db.getModel('User');
    await User.create({
      name: 'body-filter-user',
      age: 21,
      email: 'before-update@example.com',
    });

    const config = {
      path: '/localhost/user',
      model: User,
      idAttribute: 'name',
      methods: ['POST', 'PUT', 'GET'],
      bodyFilter: ['name', 'age'],
    };

    app.use(Coral(config));

    const createRes = await request(app)
      .post(config.path)
      .send({
        name: 'created-via-filter',
        age: 28,
        email: 'ignored-on-create@example.com',
      })
      .expect(200);

    expect(createRes.body.name).toBe('created-via-filter');
    expect(createRes.body.age).toBe(28);
    expect(createRes.body.email).toBeUndefined();

    const updateRes = await request(app)
      .put(`${config.path}/body-filter-user`)
      .send({
        age: 30,
        email: 'ignored-on-update@example.com',
      })
      .expect(200);

    expect(updateRes.body.name).toBe('body-filter-user');
    expect(updateRes.body.age).toBe(30);
    expect(updateRes.body.email).toBe('before-update@example.com');
  });

  it('perPage - should apply page size and cap limit to perPage * 10', async () => {
    const User = db.getModel('User');

    await User.insertMany(
      Array.from({ length: 20 }, (_, index) => ({
        name: `user-${String(index).padStart(2, '0')}`,
        age: 40 + index,
        email: `user-${index}@example.com`,
      })),
    );

    const config = {
      path: '/localhost/user',
      model: User,
      methods: ['GET'],
      perPage: 1,
      options: {
        sort: 'name',
      },
    };

    app.use(Coral(config));

    const pageRes = await request(app)
      .get(config.path)
      .query({
        page: 1,
        sort: 'name',
        order: 'asc',
      })
      .expect(200);

    expect(pageRes.body).toHaveLength(1);
    expect(pageRes.body[0].name).toBe('def');

    const cappedLimitRes = await request(app)
      .get(config.path)
      .query({
        limit: 100,
        sort: 'name',
        order: 'asc',
      })
      .expect(200);

    expect(cappedLimitRes.body).toHaveLength(10);
  });

  it('idParam - should resolve identifier using custom route param', async () => {
    const config = {
      path: '/localhost/user/:userName',
      model: db.getModel('User'),
      methods: ['GET'],
      idAttribute: 'name',
      idParam: 'userName',
    };

    app.use(Coral(config));

    const res = await request(app).get('/localhost/user/abc').expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('abc');
  });

  it('conditions/options/fields/query - should merge config defaults and apply query overrides', async () => {
    const config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      methods: ['GET'],
      conditions: {
        name: {
          $in: ['abc', 'def', 'xyz'],
        },
      },
      options: {
        limit: 2,
      },
      fields: 'name age email',
      query: {
        conditions: {
          age: {
            $lte: 20,
          },
        },
        options: {
          sort: '-name',
        },
        fields: 'name -_id',
      },
    };

    app.use(Coral(config));

    const res = await request(app).get(config.path).expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('def');
    expect(res.body[1].name).toBe('abc');
    expect(res.body[0].age).toBeUndefined();
    expect(res.body[0].email).toBeUndefined();
    expect(res.body[0]._id).toBeUndefined();
  });
});
