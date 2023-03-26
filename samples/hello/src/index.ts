import * as dotenv from 'dotenv';
import { combineLatest, map, Observable, tap } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  assetOf,
  AssetSelector,
  Commission,
  d,
  Dependency,
  instrumentNotSupported,
  instrumentOf,
  InstrumentSelector,
  useLogger,
  withCore
} from '@quantform/core';
import { sqlLite } from '@quantform/sqlite';

import { useCumulativeVolume } from './use-cumulative-volume';

dotenv.config();

export const module2: Dependency[] = [
  ...withCore(),
  ...Binance({
    simulator: {
      commission: Commission.Zero
    }
  }),
  sqlLite()
];

export function useTriangle(a: AssetSelector, b: AssetSelector, c: AssetSelector) {
  const a_c = Binance.useOrderbookTicker(
    new InstrumentSelector(a.name, c.name, a.adapterName)
  );
  const a_b = Binance.useOrderbookTicker(
    new InstrumentSelector(a.name, b.name, a.adapterName)
  );
  const c_b = Binance.useOrderbookTicker(
    new InstrumentSelector(c.name, b.name, c.adapterName)
  );
  const btc = d(1);
  const { debug } = useLogger(useTriangle.name, '#0f0');

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

      debug(cQty, a_c.bids.rate, a_b.bids.rate, c_b.asks.rate);

      return cQty;
    })
  );
}

export default function (): Observable<any> {
  const { info } = useLogger(useTriangle.name, '#f00');
  /*
  return Binance.useTrade(instrumentOf('binance:tlm-btc')).pipe(
    tap(it => {
      if (it !== instrumentNotSupported) {
        console.log(it.timestamp, it);
      }
    })
  );
*/
  return useCumulativeVolume(instrumentOf('binance:btc-usdt')).pipe(
    tap(it => info('', it))
  );
  /*
  return useTriangle(
    assetOf('binance:jasmy'),
    assetOf('binance:usdt'),
    assetOf('binance:btc')
  );*/
}
