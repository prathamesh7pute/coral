import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import type { CoralConfig } from '../../src/models/index.ts';
import db from '../helper/db';

type UserSnapshot = {
  name: string | undefined;
  age: number | undefined;
  email: string | undefined;
  info: string | undefined;
};

function normalizeUser(value: unknown): UserSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  return {
    name: typeof record.name === 'string' ? record.name : undefined,
    age: typeof record.age === 'number' ? record.age : undefined,
    email: typeof record.email === 'string' ? record.email : undefined,
    info: typeof record.info === 'string' ? record.info : undefined,
  };
}

describe('Coral v1 golden behavior', () => {
  let config: CoralConfig;

  let app: express.Express;

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.initialise();
    app = express();
    app.use(express.json());
    config = {
      path: '/localhost/user',
      model: db.getModel('User'),
      idAttribute: 'name',
    };
    app.use(Coral(config));
  });

  it('captures CRUD route baseline behavior', async () => {
    const listBeforeResponse = await request(app)
      .get(config.path)
      .query({ sort: 'name', order: 'asc', select: 'name,age,-_id' })
      .expect(200);

    const getOneResponse = await request(app)
      .get(`${config.path}/abc`)
      .query({ select: 'name,age,-_id' })
      .expect(200);

    const createResponse = await request(app)
      .post(config.path)
      .set('accept', 'application/json')
      .send({
        name: 'new-user',
        age: 44,
        email: 'new-user@example.com',
      })
      .expect(200);

    const updateResponse = await request(app)
      .put(`${config.path}/abc`)
      .set('accept', 'application/json')
      .send({
        name: 'abc-updated',
        age: 11,
        email: 'abc-updated@example.com',
      })
      .expect(200);

    const deleteResponse = await request(app).delete(`${config.path}/def`).expect(200);

    const listAfterResponse = await request(app)
      .get(config.path)
      .query({ sort: 'name', order: 'asc', select: 'name,age,-_id' })
      .expect(200);

    const snapshot = {
      statuses: {
        listBefore: listBeforeResponse.status,
        getOne: getOneResponse.status,
        create: createResponse.status,
        update: updateResponse.status,
        delete: deleteResponse.status,
        listAfter: listAfterResponse.status,
      },
      listBefore: listBeforeResponse.body,
      oneBefore: getOneResponse.body,
      created: normalizeUser(createResponse.body),
      updated: normalizeUser(updateResponse.body),
      deleted: normalizeUser(deleteResponse.body),
      listAfter: listAfterResponse.body,
    };

    expect(snapshot).toMatchInlineSnapshot(`
      {
        "created": {
          "age": 44,
          "email": "new-user@example.com",
          "info": "new-user is 44 years old",
          "name": "new-user",
        },
        "deleted": {
          "age": 20,
          "email": undefined,
          "info": "def is 20 years old",
          "name": "def",
        },
        "listAfter": [
          {
            "age": 11,
            "id": null,
            "info": "abc-updated is 11 years old",
            "name": "abc-updated",
          },
          {
            "age": 44,
            "id": null,
            "info": "new-user is 44 years old",
            "name": "new-user",
          },
          {
            "age": 30,
            "id": null,
            "info": "xyz is 30 years old",
            "name": "xyz",
          },
        ],
        "listBefore": [
          {
            "age": 10,
            "id": null,
            "info": "abc is 10 years old",
            "name": "abc",
          },
          {
            "age": 20,
            "id": null,
            "info": "def is 20 years old",
            "name": "def",
          },
          {
            "age": 30,
            "id": null,
            "info": "xyz is 30 years old",
            "name": "xyz",
          },
        ],
        "oneBefore": {
          "age": 10,
          "id": null,
          "info": "abc is 10 years old",
          "name": "abc",
        },
        "statuses": {
          "create": 200,
          "delete": 200,
          "getOne": 200,
          "listAfter": 200,
          "listBefore": 200,
          "update": 200,
        },
        "updated": {
          "age": 11,
          "email": "abc-updated@example.com",
          "info": "abc-updated is 11 years old",
          "name": "abc-updated",
        },
      }
    `);
  });

  it('captures query path baseline behavior', async () => {
    const queryResponse = await request(app)
      .get(config.path)
      .query({
        sort: 'name',
        order: 'asc',
        skip: 1,
        limit: 1,
        select: 'name,age,-_id',
      })
      .expect(200);

    const pageResponse = await request(app)
      .get(config.path)
      .query({
        sort: 'name',
        order: 'asc',
        page: 1,
        select: 'name,age,-_id',
      })
      .expect(200);

    const snapshot = {
      statuses: {
        query: queryResponse.status,
        page: pageResponse.status,
      },
      queryResult: queryResponse.body,
      pageResult: pageResponse.body,
    };

    expect(snapshot).toMatchInlineSnapshot(`
      {
        "pageResult": [],
        "queryResult": [
          {
            "age": 20,
            "id": null,
            "info": "def is 20 years old",
            "name": "def",
          },
        ],
        "statuses": {
          "page": 200,
          "query": 200,
        },
      }
    `);
  });
});
