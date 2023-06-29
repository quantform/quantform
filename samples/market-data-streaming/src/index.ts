import * as dotenv from 'dotenv';
import { combineLatest, tap, throttleTime } from 'rxjs';

import { binance } from '@quantform/binance';
import { Commission, instrumentOf, useLogger } from '@quantform/core';

import { whenTradeVolumeAccumulated } from './when-trade-volume-accumulated';

dotenv.config();

export function onInstall() {
  return [
    ...binance({
      simulator: {
        commission: Commission.Zero
      }
    })
  ];
}

export function onAwake() {
  const { info } = useLogger('market-data-streaming');

  return combineLatest([
    whenTradeVolumeAccumulated(instrumentOf('binance:btc-usdt')),
    whenTradeVolumeAccumulated(instrumentOf('binance:eth-usdt'))
  ]).pipe(
    throttleTime(1000),
    tap(([btc, eth]) => info(`accumulated volume: ${btc} BTC, ${eth} ETH`))
  );
}
