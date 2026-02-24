/**
 * Test dependencies.
 */

import type { Model } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import SubDocQuery from '../../src/subDocQuery';
import db from '../helper/db';

describe('subDocQuery edge tests', () => {
  let subDocQuery: SubDocQuery;

  beforeAll(async () => {
    await db.connect();
    subDocQuery = new SubDocQuery(db.getModel('Article'));
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.initialise();
  });

  it('find - should return undefined when parent is not found', async () => {
    const result = await subDocQuery.find({
      conditions: {
        name: 'missing-article',
      },
      subDoc: {
        path: 'comments',
      },
    });

    expect(result).toBeUndefined();
  });

  it('find - should return undefined when nested chain cannot continue', async () => {
    const result = await subDocQuery.find({
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-that-does-not-exist',
        },
        subDoc: {
          path: 'replies',
        },
      },
    });

    expect(result).toBeUndefined();
  });

  it('find - should return undefined when subDoc config is missing', async () => {
    const result = await subDocQuery.find({
      conditions: {
        name: 'article-one',
      },
    });

    expect(result).toBeUndefined();
  });

  it('findOne - should return undefined when located child is an array', async () => {
    const result = await subDocQuery.findOne({
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
      },
    });

    expect(result).toBeUndefined();
  });

  it('create - should return undefined when payload is an array', async () => {
    const result = await subDocQuery.create(
      {
        conditions: {
          name: 'article-one',
        },
        subDoc: {
          path: 'comments',
        },
      },
      [
        {
          name: 'invalid-array-payload',
        },
      ],
    );

    expect(result).toBeUndefined();
  });

  it('findOneAndUpdate - should return undefined when payload is an array', async () => {
    const result = await subDocQuery.findOneAndUpdate(
      {
        conditions: {
          name: 'article-one',
        },
        subDoc: {
          path: 'comments',
          conditions: {
            name: 'comment-one',
          },
        },
      },
      [
        {
          body: 'should-not-apply',
        },
      ],
    );

    expect(result).toBeUndefined();
  });

  it('findOneAndRemove - should return null when target record is missing', async () => {
    const result = await subDocQuery.findOneAndRemove({
      conditions: {
        name: 'article-one',
      },
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'comment-that-does-not-exist',
        },
      },
    });

    expect(result).toBeNull();
  });

  it('findOneAndRemove - should call remove when removable child exposes remove()', async () => {
    const remove = vi.fn();
    const save = vi.fn().mockResolvedValue(undefined);

    const parent = {
      comments: [{ name: 'target-comment', remove }],
      save,
    };

    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(parent),
      }),
    } as unknown as Model<object>;

    const removableQuery = new SubDocQuery(fakeModel);

    const result = await removableQuery.findOneAndRemove({
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'target-comment',
        },
      },
    });

    expect(result).toBeNull();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('findOneAndRemove - should call deleteOne when remove() is not available', async () => {
    const deleteOne = vi.fn();
    const save = vi.fn().mockResolvedValue(undefined);

    const parent = {
      comments: [{ name: 'target-comment', deleteOne }],
      save,
    };

    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(parent),
      }),
    } as unknown as Model<object>;

    const removableQuery = new SubDocQuery(fakeModel);

    const result = await removableQuery.findOneAndRemove({
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'target-comment',
        },
      },
    });

    expect(result).toBeNull();
    expect(deleteOne).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('findOneAndRemove - should skip remove/deleteOne when child has neither method', async () => {
    const save = vi.fn().mockResolvedValue(undefined);

    const parent = {
      comments: [{ name: 'target-comment' }],
      save,
    };

    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(parent),
      }),
    } as unknown as Model<object>;

    const removableQuery = new SubDocQuery(fakeModel);

    const result = await removableQuery.findOneAndRemove({
      subDoc: {
        path: 'comments',
        conditions: {
          name: 'target-comment',
        },
      },
    });

    expect(result).toBeNull();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('run - should pass normalized Error to callback when model throws non-Error', async () => {
    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockRejectedValue('boom'),
      }),
    } as unknown as Model<object>;

    const failingQuery = new SubDocQuery(fakeModel);
    const callback = vi.fn();

    const result = await failingQuery.find(
      {
        subDoc: {
          path: 'comments',
        },
      },
      callback,
    );

    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(1);
    const [firstCall] = callback.mock.calls;
    if (!firstCall) {
      throw new Error('Expected callback to be called');
    }
    const [callbackError] = firstCall;
    expect(callbackError).toBeInstanceOf(Error);
    expect((callbackError as Error).message).toBe('Unexpected sub-document query error');
  });

  it('run - should throw normalized Error when no callback is provided', async () => {
    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockRejectedValue('boom'),
      }),
    } as unknown as Model<object>;

    const failingQuery = new SubDocQuery(fakeModel);

    await expect(
      failingQuery.find({
        subDoc: {
          path: 'comments',
        },
      }),
    ).rejects.toThrow('Unexpected sub-document query error');
  });

  it('run - should pass through Error instance to callback', async () => {
    const fakeModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockRejectedValue(new Error('boom')),
      }),
    } as unknown as Model<object>;

    const failingQuery = new SubDocQuery(fakeModel);
    const callback = vi.fn();

    const result = await failingQuery.find(
      {
        subDoc: {
          path: 'comments',
        },
      },
      callback,
    );

    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(1);
    const [firstCall] = callback.mock.calls;
    if (!firstCall) {
      throw new Error('Expected callback to be called');
    }
    const [callbackError] = firstCall as [Error];
    expect(callbackError).toBeInstanceOf(Error);
    expect(callbackError.message).toBe('boom');
  });
});
