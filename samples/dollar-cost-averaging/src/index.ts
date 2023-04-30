import * as dotenv from 'dotenv';
import { combineLatest, concatMap, of, retry, switchMap } from 'rxjs';

import { binance } from '@quantform/binance';
import { Commission, strat } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

import { useExecutor } from './use-executor';
import { useInstrument } from './use-instrument';
import { useOrderSizing } from './use-order-sizing';
import { usePeriodInterval } from './use-period-interval';

dotenv.config();

function useDollarCostAveraging() {
  return usePeriodInterval().pipe(
    concatMap(() =>
      useInstrument().pipe(
        switchMap(instrument =>
          combineLatest([of(instrument), useOrderSizing(instrument)])
        ),
        switchMap(([instrument, quantity]) => useExecutor(instrument, quantity)),
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
