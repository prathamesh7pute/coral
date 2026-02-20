/**
 * Test dependencies.
 */

import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import { describe, expect, it } from 'vitest';
import Coral from '../../src/coral';

describe('Coral internal guard tests', () => {
  it('should throw when route handler is invoked without coralQueryConfig', () => {
    const router = Coral({
      path: '/internal/users',
      model: {} as Model<object>,
    });

    const nonIdRouteLayer = (
      router as unknown as {
        stack: Array<{
          route?: {
            path?: string;
            stack: Array<{
              method?: string;
              handle: (req: Request, res: Response, next: () => void) => void;
            }>;
          };
        }>;
      }
    ).stack.find((layer) => layer.route?.path === '/internal/users');

    if (!nonIdRouteLayer?.route) {
      throw new Error('Expected route layer for /internal/users');
    }

    const getHandlerLayer = nonIdRouteLayer.route.stack.find((layer) => layer.method === 'get');
    if (!getHandlerLayer) {
      throw new Error('Expected GET route handler layer');
    }

    expect(() => {
      getHandlerLayer.handle({} as Request, {} as Response, () => {});
    }).toThrow('CoralQueryConfig is missing on request object');
  });
});
