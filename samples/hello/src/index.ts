import { combineLatest, Observable, tap } from 'rxjs';

import {
  instrumentNotSupported,
  useBinanceOrderbook,
  withBinance
} from '@quantform/binance';
import { Dependency, instrumentOf, log, withCore } from '@quantform/core';
import { withSqlLite } from '@quantform/sqlite';

export const module2: Dependency[] = [
  ...withCore(),
  ...withBinance({ logger: log('binance') }),
  ...withSqlLite()
];

export default function (): Observable<any> {
  return combineLatest([
    useBinanceOrderbook(instrumentOf('binance:btc-usdt')),
    useBinanceOrderbook(instrumentOf('binance:eth-usdt')),
    useBinanceOrderbook(instrumentOf('binance:ada-usdt'))
  ]).pipe(
    tap(([btc, eth, ada]) => {
      if (
        btc !== instrumentNotSupported &&
        eth !== instrumentNotSupported &&
        ada !== instrumentNotSupported
      ) {
        console.log(btc.asks.rate, eth.asks.rate, ada.asks.rate);
      }
    })
  );
}
