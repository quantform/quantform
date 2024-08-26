import { forkJoin, from, Subject, switchMap } from 'rxjs';

import { InstrumentSelector } from '@quantform/core';

import { usePool } from './api/use-pool';
import { withToken } from './with-token';

export function whenSwap(instrument: InstrumentSelector) {
  const ob = new Subject<any>();

  return forkJoin([withToken(instrument.base), withToken(instrument.quote)]).pipe(
    switchMap(([base, quote]) =>
      from(
        usePool(base, quote).on(
          'Swap',
          (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
            ob.next({
              sender,
              recipient,
              amount0,
              amount1,
              sqrtPriceX96,
              liquidity,
              tick
            });
          }
        )
      )
    ),
    switchMap(() => ob.asObservable())
  );
}
