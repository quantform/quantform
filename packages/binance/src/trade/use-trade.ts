import { of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { useTradeSocket } from './use-trade-socket';

export const useTrade = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useTradeSocket(it);
    })
  )
);
