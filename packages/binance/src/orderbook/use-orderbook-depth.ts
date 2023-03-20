import { of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { Level, useOrderbookDepthSocket } from './use-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookDepth = use((instrument: InstrumentSelector, level: Level) =>
  useInstrument(instrument).pipe(
    switchMap(it =>
      it !== instrumentNotSupported
        ? useOrderbookDepthSocket(it, level)
        : of(instrumentNotSupported)
    )
  )
);
