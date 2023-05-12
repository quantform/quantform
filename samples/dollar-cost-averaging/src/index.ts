import * as dotenv from 'dotenv';
import {
  catchError,
  combineLatest,
  exhaustMap,
  filter,
  interval,
  of,
  retry,
  switchMap
} from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import { Commission, d, errored, instrumentOf, useLogger } from '@quantform/core';

dotenv.config();

export default function useDollarCostAveraging() {
  const { withBalance, withOrderNew, withInstrument } = useBinance();
  const { error } = useLogger(useDollarCostAveraging.name);

  return combineLatest([
    // join trading instrument, to get the number of decimal places for buy order
    withInstrument(instrumentOf('binance:btc-usdt)')),
    //
    interval(1000)
  ]).pipe(
    exhaustMap(([instrument]) =>
      // get the current quote balance amount (USDT for this case)
      withBalance(instrument.quote).pipe(
        // once we have enough balance (> 100 USDT), go on
        filter(balance => balance.free.gt(d(100))),
        switchMap(balance =>
          // request new buy order
          withOrderNew({
            instrument,
            quantity: balance.free,
            timeInForce: 'GTC',
            type: 'MARKET'
          })
        ),
        retry({ delay: 5000, count: 3 }),
        catchError(err => {
          error('failed to open buy order', err);
          return of(errored);
        })
      )
    )
  );
}

export const dependency = [
  ...binance({
    simulator: {
      commission: Commission.Zero
    }
  })
];
