import * as dotenv from 'dotenv';
import { combineLatest, last, tap, throttleTime, zip } from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import {
  assetOf,
  Commission,
  d,
  instrumentOf,
  Storage,
  useLogger,
  useStorage,
  useTimestamp
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { whenTradeVolumeAccumulated } from './when-trade-volume-accumulated';

dotenv.config();

export function onInstall() {
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
}

const volumeStorageType = Storage.createObject('volume', {
  timestamp: 'number',
  btc: 'decimal',
  eth: 'decimal'
});

export function onAwake() {
  const { info } = useLogger('market-data-streaming');
  const measurement = useStorage(['measurement']);
  const { withBalance } = useBinance();

  return withBalance(assetOf('binance:usdt')).pipe(tap(it => info(it.free)));

  return zip([
    whenTradeVolumeAccumulated(instrumentOf('binance:btc-usdt')),
    whenTradeVolumeAccumulated(instrumentOf('binance:eth-usdt'))
  ]).pipe(
    tap(([btc, eth]) => info(`accumulated volume: ${btc} BTC, ${eth} ETH`)),
    tap(([btc, eth]) =>
      measurement.save(volumeStorageType, [{ timestamp: useTimestamp(), btc, eth }])
    )
  );
}
