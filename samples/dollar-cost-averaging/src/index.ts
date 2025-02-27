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
    const { watchBalance, createOrder, getInstrument } = useBinance();
    const { error } = useLogger('dca');

    return combineLatest([
      getInstrument(instrumentOf('binance:btc-usdt)')),
      interval(1000)
    ]).pipe(
      exhaustMap(([instrument]) =>
        watchBalance(instrument.quote).pipe(
          filter(balance => balance.free.gt(d(100))),
          switchMap(balance =>
            createOrder({
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
