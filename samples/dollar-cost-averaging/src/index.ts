import * as dotenv from 'dotenv';
import {
  catchError,
  combineLatest,
  exhaustMap,
  filter,
  interval,
  of,
  retry,
  switchMap,
  tap
} from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import { Commission, d, errored, instrumentOf, useLogger } from '@quantform/core';

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
  const { withBalance, withOrderNew, withInstrument, whenOrderbookTicker } = useBinance();
  const { error } = useLogger('dca');

  return whenOrderbookTicker(instrumentOf('binance:btc-usdt')).pipe(
    tap(it => console.log(it))
  );

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
