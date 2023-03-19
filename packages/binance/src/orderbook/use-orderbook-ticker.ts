import { of, shareReplay, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import {
  asReadonly,
  instrumentNotSupported,
  InstrumentSelector,
  withMemo
} from '@quantform/core';

import { useOrderbookTickerSocket } from './use-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookTicker = withMemo((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it =>
      it !== instrumentNotSupported
        ? useOrderbookTickerSocket(it)
        : of(instrumentNotSupported)
    ),
    asReadonly(),
    shareReplay(1)
  )
);
