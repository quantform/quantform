import { combineLatest, Observable, tap } from 'rxjs';

import {
  instrumentNotSupported,
  useBinanceOrderbook,
  withBinance
} from '@quantform/binance';
import { instrumentOf, ModuleDefinition, withCore } from '@quantform/core';

export const module2: ModuleDefinition = {
  dependencies: [...withCore().dependencies, ...withBinance({}).dependencies]
};

export default function (): Observable<any> {
  return combineLatest([
    useBinanceOrderbook(instrumentOf('binance:btc-usdt')),
    useBinanceOrderbook(instrumentOf('binance:eth-usdt'))
  ]).pipe(
    tap(([btc, eth]) => {
      if (btc !== instrumentNotSupported && eth !== instrumentNotSupported) {
        console.log(btc.asks.rate, eth.asks.rate);
      }
    })
  );
}
