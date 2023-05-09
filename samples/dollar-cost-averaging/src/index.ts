import * as dotenv from 'dotenv';
import { combineLatest, concatMap, of, retry, switchMap } from 'rxjs';

import { binance } from '@quantform/binance';
import { Commission, strat } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { whenPeriodInterval } from './when-period-interval';
import { withExecutor } from './with-executor';
import { withInstrument } from './with-instrument';
import { withOrderSizing } from './with-order-sizing';

dotenv.config();

function useDollarCostAveraging() {
  return whenPeriodInterval().pipe(
    concatMap(() =>
      withInstrument().pipe(
        switchMap(instrument =>
          combineLatest([of(instrument), withOrderSizing(instrument)])
        ),
        switchMap(([instrument, quantity]) => withExecutor(instrument, quantity)),
        retry({ delay: 10000 })
      )
    )
  );
}

export default strat(
  () => useDollarCostAveraging(),
  [
    ...binance({
      simulator: {
        commission: Commission.Zero
      }
    }),
    sqlite()
  ]
);
