import * as dotenv from 'dotenv';
import {
  catchError,
  combineLatest,
  EMPTY,
  exhaustMap,
  filter,
  interval,
  retry,
  switchMap,
  tap
} from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import { behavior, d, instrumentOf, strategy, useLogger } from '@quantform/core';

export default strategy(() => {
  dotenv.config();

  behavior(() => {
    const { withBalance, withOrderNew, withInstrument, whenOrderbookTicker } =
      useBinance();
    const { error } = useLogger('dca');
    const { info } = useLogger('my-first-pipeline');

    whenOrderbookTicker().pipe(
      tap(({ bids, asks }) => info(`current top bid: ${bids.rate}, ask: ${asks.rate}`))
    );

    return combineLatest([
      withInstrument(instrumentOf('binance:btc-usdt)')),
      interval(1000)
    ]).pipe(
      exhaustMap(([instrument]) =>
        withBalance(instrument.quote).pipe(
          filter(balance => balance.free.gt(d(100))),
          switchMap(balance =>
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
  });

  return [...binance({})];
});
