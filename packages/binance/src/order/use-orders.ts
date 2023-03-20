import { concatAll, from, of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { useOrdersChanges } from './use-order-changes';
import { useOrdersSnapshot } from './use-orders-snapshot';

export const useOrders = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(instrument => {
      if (instrument === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useOrdersSnapshot(instrument).pipe(
        switchMap(it => from([of(it), useOrdersChanges(instrument)]).pipe(concatAll()))
      );
    })
  )
);
