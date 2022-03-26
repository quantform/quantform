import { cache } from './policy';

describe('cache policy tests', () => {
  test('string as key cache', async () => {
    let counter = 0;

    const request = async () => ++counter;

    expect(await cache('abc', request)).toBe(1);
    expect(await cache('abc', request)).toBe(1);
    expect(await cache('abc', () => request())).toBe(1);
    expect(await cache('abc', () => request())).toBe(1);
  });

  test('object as key cache', async () => {
    let counter = 0;

    const request = async () => ++counter;

    expect(await cache({ from: 1, to: 2, content: 'abc' }, request)).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, request)).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, () => request())).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, () => request())).toBe(1);
  });
});
