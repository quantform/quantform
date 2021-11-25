import { retryAsync } from 'ts-retry';
import * as hash from 'object-hash';

export function retry<T>(fn: () => Promise<T>): Promise<T> {
  return retryAsync(fn, { delay: 1000, maxTry: 3 });
}

const inMemoryCache: Record<string, any> = {};

export async function cache<T>(key: any, fn: () => Promise<T>): Promise<T> {
  const hashed = hash(key);

  if (inMemoryCache[hashed]) {
    return inMemoryCache[hashed];
  }

  return (inMemoryCache[hashed] = await fn());
}
