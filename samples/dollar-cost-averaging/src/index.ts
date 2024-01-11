import * as dotenv from 'dotenv';
import {
  catchError,
  combineLatest,
  EMPTY,
  exhaustMap,
  filter,
  interval,
  retry,
  switchMap
} from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import { Commission, d, instrumentOf, useLogger } from '@quantform/core';

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
  const { withBalance, withOrderNew, withInstrument } = useBinance();
  const { error } = useLogger('dca');

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
          return EMPTY;
        })
      )
    )
  );
}
