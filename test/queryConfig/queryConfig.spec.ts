/**
 * Test dependencies.
 */

import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import type { CoralConfig, SubDocConfig } from '../../src/models/index.ts';
import createQueryConfig from '../../src/queryConfig';

function createMockResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };

  response.status.mockReturnValue(response);
  return response as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

function createBaseConfig(overrides?: Partial<CoralConfig>): CoralConfig {
  const model = {} as Model<object>;

  return {
    path: '/localhost/user',
    model,
    ...overrides,
  };
}

const createdDocModel =
  mongoose.models.QueryConfigCreatedDoc ??
  mongoose.model(
    'QueryConfigCreatedDoc',
    new mongoose.Schema(
      {
        _id: {
          type: String,
          required: true,
        },
      },
      { versionKey: false },
    ),
  );

function createCreatedDoc(id = 'new-id') {
  return new createdDocModel({ _id: id });
}

function createRequest(overrides?: Partial<Request>): Request {
  return {
    method: 'GET',
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as Request;
}

describe('createQueryConfig tests', () => {
  it('should parse array query values and path params using first value', () => {
    const req = createRequest({
      params: {
        userName: ['abc', 'def'] as unknown as string,
      },
      query: {
        sort: [undefined] as unknown as string,
        skip: ['2'] as unknown as string,
      },
    });

    const res = createMockResponse();
    const config = createBaseConfig({
      idAttribute: 'name',
      idParam: 'userName',
    });

    const queryConfig = createQueryConfig(req, res, config);

    expect((queryConfig.conditions as Record<string, string>).name).toBe('abc');
    expect(queryConfig.options.skip).toBe(2);
    expect(queryConfig.options.sort).toBeUndefined();
  });

  it('should clone subDoc conditions without mutating original config', () => {
    const subDoc: SubDocConfig = {
      path: 'comments',
      conditions: { name: 'comment-one' },
      subDoc: {
        path: 'replies',
      },
    };

    const req = createRequest();
    const res = createMockResponse();

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        subDoc,
      }),
    );

    const createdSubDoc = queryConfig.subDoc;
    if (!createdSubDoc || !createdSubDoc.conditions) {
      throw new Error('Expected cloned subDoc conditions');
    }

    createdSubDoc.conditions.name = 'updated-in-clone';
    expect(subDoc.conditions?.name).toBe('comment-one');
  });

  it('should apply skip from query string when provided', () => {
    const req = createRequest({
      query: {
        skip: '5',
      },
    });

    const res = createMockResponse();
    const queryConfig = createQueryConfig(req, res, createBaseConfig());

    expect(queryConfig.options.skip).toBe(5);
  });

  it('should ignore invalid numeric query values', () => {
    const req = createRequest({
      query: {
        skip: 'not-a-number',
      },
    });

    const res = createMockResponse();
    const queryConfig = createQueryConfig(req, res, createBaseConfig());

    expect(queryConfig.options.skip).toBeUndefined();
  });

  it('should cap limit to 100 when perPage is not configured', () => {
    const req = createRequest({
      query: {
        limit: '999',
      },
    });

    const res = createMockResponse();
    const queryConfig = createQueryConfig(req, res, createBaseConfig());

    expect(queryConfig.options.limit).toBe(100);
  });

  it('should use _id as default idAttribute when idAttribute is not configured', () => {
    const req = createRequest({
      params: {
        idAttribute: 'abc123',
      },
    });

    const res = createMockResponse();
    const queryConfig = createQueryConfig(req, res, createBaseConfig());

    expect((queryConfig.conditions as Record<string, string>)._id).toBe('abc123');
  });

  it('should create empty subDoc.conditions when idParam is present but idAttribute is not configured', () => {
    const req = createRequest({
      params: {
        commentName: 'comment-one',
      },
    });
    const res = createMockResponse();

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        subDoc: {
          path: 'comments',
          idParam: 'commentName',
        },
      }),
    );

    expect(queryConfig.subDoc?.conditions).toEqual({});
  });

  it('callback should return 400 when created document id is missing', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createMockResponse();

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        updateRef: {
          model: {
            findById: vi.fn(),
          } as unknown as Model<object>,
          path: 'articles',
          findOneId: 'user-id',
        },
      }),
    );

    await queryConfig.callback(null, []);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Created document id is missing' });
  });

  it('callback should return 400 when reference id is missing', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createMockResponse();

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        updateRef: {
          model: {
            findById: vi.fn(),
          } as unknown as Model<object>,
          path: 'articles',
        },
      }),
    );

    await queryConfig.callback(null, createCreatedDoc('new-id'));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reference id is missing' });
  });

  it('callback should return 404 when reference document does not exist', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createMockResponse();

    const findById = vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        updateRef: {
          model: {
            findById,
          } as unknown as Model<object>,
          path: 'articles',
          findOneId: 'missing-user-id',
        },
      }),
    );

    await queryConfig.callback(null, createCreatedDoc('new-id'));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reference document not found' });
  });

  it('callback should use function findOneId and update array reference', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createMockResponse();

    const save = vi.fn().mockResolvedValue(undefined);
    const refDoc = {
      articles: ['existing-id'],
      save,
    };

    const findById = vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue(refDoc),
    });

    const findOneId = vi.fn().mockReturnValue('user-123');

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        updateRef: {
          model: {
            findById,
          } as unknown as Model<object>,
          path: 'articles',
          findOneId,
        },
      }),
    );

    const createdData = createCreatedDoc('created-article-id');
    await queryConfig.callback(null, createdData);

    expect(findOneId).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith('user-123');
    expect(refDoc.articles).toEqual(['existing-id', 'created-article-id']);
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(createdData);
  });

  it('callback should return public error when reference update throws', async () => {
    const req = createRequest({ method: 'POST' });
    const res = createMockResponse();

    const findById = vi.fn().mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error('db failed')),
    });

    const queryConfig = createQueryConfig(
      req,
      res,
      createBaseConfig({
        updateRef: {
          model: {
            findById,
          } as unknown as Model<object>,
          path: 'articles',
          findOneId: 'user-123',
        },
      }),
    );

    await queryConfig.callback(null, createCreatedDoc('new-id'));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reference update failed' });
  });
});
