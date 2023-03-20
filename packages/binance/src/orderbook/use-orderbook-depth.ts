import { of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, withShare } from '@quantform/core';

import { Level, useOrderbookDepthSocket } from './use-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookDepth = withShare(
  (instrument: InstrumentSelector, level: Level) =>
    useInstrument(instrument).pipe(
      switchMap(it =>
        it !== instrumentNotSupported
          ? useOrderbookDepthSocket(it, level)
          : of(instrumentNotSupported)
      )
    )
);
