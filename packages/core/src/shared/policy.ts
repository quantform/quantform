import { retryAsync } from 'ts-retry';

export function retry<T>(fn: () => Promise<T>): Promise<T> {
  return retryAsync(fn, { delay: 1000, maxTry: 3 });
}
