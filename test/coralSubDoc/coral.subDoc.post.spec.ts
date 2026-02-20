/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import db from '../helper/db';

const app = express();

describe('Coral subDoc post tests', () => {
  // require to get req body parameters
  app.use(express.json());

  beforeEach(async () => {
    await db.connect();
    await db.initialise();
  });

  afterEach(async () => {
    await db.disconnect();
  });

  it('subDoc post - must create proper post route and return matching record', async () => {
    // config to pass router find method
    const config = {
      path: '/localhost/articles/:name/comments',
      model: db.getModel('Article'),
      methods: ['POST'],
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
      },
    };

    // data to be pass into post request
    const data = {
      name: 'comment-three',
      body: 'Article One Third Comment',
      replies: [
        {
          name: 'reply-one',
          body: 'Article One Third Comment First Reply',
        },
      ],
    };

    // call router get with the config
    app.use(Coral(config));

    // invoke path with supertest
    const res = await request(app)
      .post('/localhost/articles/article-one/comments')
      .set('accept', 'application/json')
      .send(data)
      .expect(200);
    expect(res.body.name).toBe('comment-three');
  });

  it('sub subDoc post - must create proper post route and return matching record', async () => {
    // config to pass router find method
    const config = {
      path: '/localhost/articles/:articleName/comments/:commentName/replies',
      model: db.getModel('Article'),
      methods: ['POST'],
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        idAttribute: 'name',
        idParam: 'commentName',
        subDoc: {
          path: 'replies',
        },
      },
    };

    // data to be pass into post request
    const data = {
      name: 'reply-three',
      body: 'Article One Second Comment Third Reply',
    };

    // call router get with the config
    app.use(Coral(config));

    // invoke path with supertest
    const res = await request(app)
      .post('/localhost/articles/article-one/comments/comment-one/replies')
      .set('accept', 'application/json')
      .send(data)
      .expect(200);
    expect(res.body.name).toBe('reply-three');
  });
});
