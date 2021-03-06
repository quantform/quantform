import { Cache } from './cache';
import { InMemoryStorage } from './storage';

describe('Cache', () => {
  test('should return cached value', async () => {
    const cache = new Cache(new InMemoryStorage());

    const value1 = await cache.tryGet(() => Promise.resolve('quantform-1'), {
      key: 'test'
    });
    const value2 = await cache.tryGet(() => Promise.resolve('quantform-2'), {
      key: 'test'
    });

    expect(value1).toEqual('quantform-1');
    expect(value2).toEqual('quantform-1');
  });
});
