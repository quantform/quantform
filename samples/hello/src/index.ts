import * as dotenv from 'dotenv';
import {
  catchError,
  combineLatest,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap
} from 'rxjs';

import {
  assetNotSupported,
  instrumentNotSupported,
  useBinanceBalance,
  useBinanceOpenOrders,
  useBinanceOrderbookTicker,
  useBinanceOrderSubmit,
  useBinanceTrade,
  withBinance
} from '@quantform/binance';
import {
  assetOf,
  AssetSelector,
  Commission,
  d,
  Dependency,
  instrumentOf,
  InstrumentSelector,
  log,
  RequestNetworkError,
  useLogger,
  useSocket,
  useState,
  withCore
} from '@quantform/core';
import { withSqlLite } from '@quantform/sqlite';

dotenv.config();

export const module2: Dependency[] = [
  ...withCore(),
  ...withBinance({
    simulator: {
      commission: Commission.Zero
    }
  }),
  ...withSqlLite()
];

export function useTriangle(a: AssetSelector, b: AssetSelector, c: AssetSelector) {
  const a_c = useBinanceOrderbookTicker(
    new InstrumentSelector(a.name, c.name, a.adapterName)
  );
  const a_b = useBinanceOrderbookTicker(
    new InstrumentSelector(a.name, b.name, a.adapterName)
  );
  const c_b = useBinanceOrderbookTicker(
    new InstrumentSelector(c.name, b.name, c.adapterName)
  );
  const btc = d(1);
  const { debug } = useLogger(useTriangle.name);

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

export function useCumulativeVolume(instrument: InstrumentSelector) {
  let [volume, setVolume] = useState(d.Zero, [useCumulativeVolume.name, instrument.id]);

  return useBinanceTrade(instrument).pipe(
    map(it => {
      if (it === instrumentNotSupported) {
        return d.Zero;
      }

      return (volume = volume.add(it.quantity));
    })
  );
}

export function useBinanceSocket(patch: string) {
  return useSocket(patch);
}

export default function (): Observable<any> {
  const { info } = useLogger(useTriangle.name);

  /*return useBinanceTrade(instrumentOf('binance:btc-usdt')).pipe(
    tap(it => {
      if (it !== instrumentNotSupported) {
        console.log(it.timestamp, it.quantity);
      }
    })
  );*/

  return useTriangle(
    assetOf('binance:jasmy'),
    assetOf('binance:usdt'),
    assetOf('binance:btc')
  );
}
