import { of, shareReplay, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, withMemo } from '@quantform/core';

import { useTradeChanges } from './use-trade-changes';

export const useTrade = withMemo((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useTradeChanges(it);
    }),
    shareReplay(1)
  )
);
