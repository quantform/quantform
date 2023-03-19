import { of, shareReplay, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  asReadonly,
  instrumentNotSupported,
  InstrumentSelector,
  withMemo
} from '@quantform/core';

import { Level, useOrderbookDepthSocket } from './use-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookDepth = withMemo(
  (instrument: InstrumentSelector, level: Level) =>
    useInstrument(instrument).pipe(
      switchMap(it =>
        it !== instrumentNotSupported
          ? useOrderbookDepthSocket(it, level)
          : of(instrumentNotSupported)
      ),
      asReadonly(),
      shareReplay(1)
    )
);
