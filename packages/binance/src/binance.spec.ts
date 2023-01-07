import { AdapterTimeProvider, Module, storage } from '@quantform/core';

import { binance, BinanceAdapter } from '@lib/index';

describe(binance.name, () => {
  test('get', () => {
    const module = new Module({
      dependencies: [
        ...binance().dependencies,
        ...storage().dependencies,
        {
          provide: AdapterTimeProvider,
          useClass: AdapterTimeProvider
        }
      ]
    });

    module.awake();

    const sut = module.get(BinanceAdapter);
  });
});
