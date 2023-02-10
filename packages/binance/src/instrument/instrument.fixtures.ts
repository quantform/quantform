import { Asset, Commission, Instrument } from '@quantform/core';

export const instrumentFixtures = {
  btc_usdt: new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 4),
    'BTCUSDT',
    Commission.Zero
  )
};
