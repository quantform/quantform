import { dependency, useHash } from './use-hash';

describe(useHash.name, () => {
  it.each<[dependency[], string]>([
    [['binance:btc'], 'binance:btc'],
    [['binance:btc', 'test'], 'binance:btc/test'],
    [['binance:btc-usdt', 123], 'binance:btc-usdt/123']
  ])('hash list of dependencies from %p to %p', (dependencies, hashed) => {
    const hash = useHash(dependencies);

    expect(hash).toEqual(hashed);
  });
});
