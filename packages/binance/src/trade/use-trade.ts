import { of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, withShare } from '@quantform/core';

import { useTradeChanges } from './use-trade-changes';

export const useTrade = withShare((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useTradeChanges(it);
    })
  )
);
