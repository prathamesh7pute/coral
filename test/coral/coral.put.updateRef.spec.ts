/**
 * Test dependencies.
 */

import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Coral from '../../src/coral';
import type { CoralConfig } from '../../src/models/index.ts';
import Query from '../../src/query';
import db from '../helper/db';
import {
  getPopulatedStringField,
  getQueryDocument,
  getQueryValueArray,
} from '../helper/queryAccessors';

const app = express();

describe('Coral put  updateRef tests', () => {
  // require to get req body parameters
  app.use(express.json());

  beforeEach(async () => {
    await db.connect();
    await db.initialise();
  });

  afterEach(async () => {
    await db.disconnect();
  });

  describe('update Ref - must update record and should not push new article reference', () => {
    let findOneUserId: string;

    // use this to retrive the findOneUserId
    beforeEach(async () => {
      const query = new Query(db.getModel('User'));
      // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10,
        },
      };
      const record = getQueryDocument(await query.findOne(config), 'Expected user record');
      expect(record.name).toBe('abc');
      findOneUserId = String(record._id);
    });

    it('put - must create proper post route and updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/article',
        model: db.getModel('Article'),
        methods: ['PUT'],
        idAttribute: 'name',
        updateRef: {
          model: db.getModel('User'),
          path: 'articles',
          findOneId: findOneUserId,
        },
      };
      // data to be pass into post request
      const data = {
        name: 'test article 1',
      };

      // call router get with the config
      app.use(Coral(config));

      // invoke path with supertest
      const res = await request(app)
        .put(`${config.path}/article-two`)
        .set('accept', 'application/json')
        .send(data)
        .expect(200);
      expect(res.body.name).toBe('test article 1');
    });

    // verify that the article reference properly got inserted
    afterEach(async () => {
      const query = new Query(db.getModel('User'));
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId,
        },
        options: {
          populate: 'articles',
        },
      };

      const record = getQueryDocument(await query.findOne(config), 'Expected user record');
      expect(record.name).toBe('abc');
      expect(record.articles).toHaveLength(1);
      const articles = getQueryValueArray(record.articles, 'Expected articles array');
      const article = getPopulatedStringField(articles[0], 'name', 'article reference');
      expect(article.name).toBe('article-one');
    });
  });

  describe('update Ref - must update record and should not update location reference', () => {
    let findOneUserId: string;

    // use this to retrive the findOneUserId
    beforeEach(async () => {
      const query = new Query(db.getModel('User'));
      const locationQuery = new Query(db.getModel('Location'));
      // unique identifier to find data
      const config = {
        conditions: {
          name: 'abc',
          age: 10,
        },
      };
      const record = getQueryDocument(await query.findOne(config), 'Expected user record');
      expect(record.name).toBe('abc');
      findOneUserId = String(record._id);

      // data to insert
      const data = {
        streetOne: 'buckland',
      };
      // invoke query create method
      const createdLocation = await locationQuery.create({}, data);
      if (!createdLocation || Array.isArray(createdLocation)) {
        throw new Error('Expected one created location');
      }
      expect(createdLocation.streetOne).toBe('buckland');
    });

    it('put - must create proper put route and and should not updateReference ', async () => {
      // config to pass router find method
      const config: CoralConfig = {
        path: '/localhost/location',
        model: db.getModel('Location'),
        methods: ['PUT'],
        idAttribute: 'streetOne',
        updateRef: {
          model: db.getModel('User'),
          path: 'location',
          findOneId: findOneUserId,
        },
      };
      // data to be pass into post request
      const data = {
        streetOne: '345 Buckland Hills Dr',
      };

      // call router get with the config
      app.use(Coral(config));

      // invoke path with supertest
      const res = await request(app)
        .put(`${config.path}/buckland`)
        .set('accept', 'application/json')
        .send(data)
        .expect(200);
      expect(res.body.streetOne).toBe('345 Buckland Hills Dr');
    });

    // verify that the article reference properly got inserted
    afterEach(async () => {
      const query = new Query(db.getModel('User'));
      // unique identifier to find data
      const config = {
        conditions: {
          _id: findOneUserId,
        },
        options: {
          populate: 'location',
        },
      };

      const record = getQueryDocument(await query.findOne(config), 'Expected user record');
      expect(record.name).toBe('abc');
      expect(record.location).toBeFalsy();
    });
  });
});
