/**
 * Test dependencies.
 */

import type { Model } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import Query from '../../src/query';

describe('query edge tests', () => {
  it('find - should pass normalized Error to callback when model throws non-Error', async () => {
    const fakeModel = {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockRejectedValue('boom'),
      }),
    } as unknown as Model<object>;

    const query = new Query(fakeModel);
    const callback = vi.fn();

    const result = await query.find({}, callback);

    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledTimes(1);
    const [firstCall] = callback.mock.calls;
    if (!firstCall) {
      throw new Error('Expected callback to be called');
    }
    const [callbackError] = firstCall;
    expect(callbackError).toBeInstanceOf(Error);
    expect((callbackError as Error).message).toBe('Unexpected query error');
  });

  it('find - should throw normalized Error when no callback is provided', async () => {
    const fakeModel = {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockRejectedValue('boom'),
      }),
    } as unknown as Model<object>;

    const query = new Query(fakeModel);

    await expect(query.find({})).rejects.toThrow('Unexpected query error');
  });

  it('create - should invoke callback with undefined when no data is provided', async () => {
    const query = new Query({} as Model<object>);
    const callback = vi.fn();

    const result = await query.create({ callback });

    expect(result).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(null, undefined);
  });

  it('create - should resolve undefined when no data and no callback are provided', async () => {
    const query = new Query({} as Model<object>);

    const result = await query.create({});

    expect(result).toBeUndefined();
  });
});
