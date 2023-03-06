import { assetOf } from './asset';
import { instrumentOf } from './instrument';
import { useHash } from './use-hash';

describe(useHash.name, () => {
  it.each<[unknown[], string]>([
    [[assetOf('binance:btc')], 'binance:btc'],
    [[assetOf('binance:btc'), 'test'], 'binance:btc/test'],
    [[instrumentOf('binance:btc-usdt')], 'binance:btc-usdt'],
    [[instrumentOf('binance:btc-usdt'), 123], 'binance:btc-usdt/123']
  ])('hash list of dependencies from %p to %p', (dependencies, hashed) => {
    const hash = useHash(dependencies);

    expect(hash).toEqual(hashed);
  });
});
