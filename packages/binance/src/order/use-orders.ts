import { concatAll, from, of, shareReplay, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  asReadonly,
  instrumentNotSupported,
  InstrumentSelector,
  withMemo
} from '@quantform/core';

import { useOrdersChanges } from './use-order-changes';
import { useOrdersSnapshot } from './use-orders-snapshot';

export const useOrders = withMemo((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useOrdersSnapshot(instrument).pipe(
        switchMap(it => from([of(it), useOrdersChanges(instrument)]).pipe(concatAll()))
      );
    }),
    shareReplay(1),
    asReadonly()
  )
);
