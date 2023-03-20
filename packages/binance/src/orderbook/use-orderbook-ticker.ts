import { of, switchMap } from 'rxjs';

import { useInstrument } from '@lib/instrument';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { useOrderbookTickerSocket } from './use-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useOrderbookTicker = use((instrument: InstrumentSelector) =>
  useInstrument(instrument).pipe(
    switchMap(it =>
      it !== instrumentNotSupported
        ? useOrderbookTickerSocket(it)
        : of(instrumentNotSupported)
    )
  )
);
