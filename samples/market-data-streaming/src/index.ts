import * as dotenv from 'dotenv';
import { map, of, tap, zip } from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import {
  after,
  before,
  behavior,
  Commission,
  d,
  instrumentOf,
  strategy,
  useLogger
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { whenTradeVolumeAccumulated } from './when-trade-volume-accumulated';

export default strategy(() => {
  dotenv.config();

  before(() => {
    console.log('before');

    return of(1);
  });

  behavior(() => {
    const { info } = useLogger('market-data-streaming');

    return zip([
      whenTradeVolumeAccumulated(instrumentOf('binance:btc-usdt')),
      whenTradeVolumeAccumulated(instrumentOf('binance:eth-usdt'))
    ]).pipe(tap(([btc, eth]) => info(`accumulated volume: ${btc} BTC, ${eth} ETH`)));
  });

  after(() => {
    const { withSimulator } = useBinance();

    return withSimulator().pipe(map(it => console.log(it.snapshot().ticks)));
  });

  return [
    ...binance({
      simulator: {
        commission: Commission.Zero,
        balance: {
          ['usdt']: { free: d(1000) }
        }
      }
    }),
    sqlite()
  ];
});
