import { combineLatest, map, Observable, tap } from 'rxjs';

import {
  instrumentNotSupported,
  useBinanceOrderbook,
  withBinance
} from '@quantform/binance';
import {
  assetOf,
  AssetSelector,
  d,
  Dependency,
  InstrumentSelector,
  log,
  withCore
} from '@quantform/core';
import { withSqlLite } from '@quantform/sqlite';

export const module2: Dependency[] = [
  ...withCore(),
  ...withBinance({ logger: log('binance') }),
  ...withSqlLite()
];

export function useTriangle(a: AssetSelector, b: AssetSelector, c: AssetSelector) {
  const a_c = useBinanceOrderbook(new InstrumentSelector(a.name, c.name, a.adapterName));
  const a_b = useBinanceOrderbook(new InstrumentSelector(a.name, b.name, a.adapterName));
  const c_b = useBinanceOrderbook(new InstrumentSelector(c.name, b.name, c.adapterName));
  const btc = d(1);

  return combineLatest([a_c, a_b, c_b]).pipe(
    map(([a_c, a_b, c_b]) => {
      if (
        a_c === instrumentNotSupported ||
        a_b === instrumentNotSupported ||
        c_b === instrumentNotSupported
      ) {
        return d.Zero;
      }

      const aQty = a_c.instrument.base.floor(btc.div(a_c.bids.rate));
      const bQty = a_b.instrument.quote.floor(aQty.mul(a_b.bids.rate));
      const cQty = c_b.instrument.base.floor(bQty.div(c_b.asks.rate));

      return cQty;
    })
  );
}

export default function (): Observable<any> {
  return useTriangle(
    assetOf('binance:mdt'),
    assetOf('binance:usdt'),
    assetOf('binance:btc')
  ).pipe(tap(it => console.log(it)));
}
