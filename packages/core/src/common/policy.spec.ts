import { cache } from './policy';

describe('cache policy tests', () => {
  test('string as key cache', async done => {
    let counter = 0;

    const request = async () => {
      return ++counter;
    };

    expect(await cache('abc', request)).toBe(1);
    expect(await cache('abc', request)).toBe(1);
    expect(await cache('abc', () => request())).toBe(1);
    expect(await cache('abc', () => request())).toBe(1);

    done();
  });

  test('object as key cache', async done => {
    let counter = 0;

    const request = async () => {
      return ++counter;
    };

    expect(await cache({ from: 1, to: 2, content: 'abc' }, request)).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, request)).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, () => request())).toBe(1);
    expect(await cache({ from: 1, to: 2, content: 'abc' }, () => request())).toBe(1);

    done();
  });
});
