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
import { behavior, d, instrumentOf, strategy, useLogger } from '@quantform/core';

export default strategy(() => {
  dotenv.config();

  behavior(() => {
    const { withBalance, withOrderNew, withInstrument } = useBinance();
    const { error } = useLogger('dca');

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
