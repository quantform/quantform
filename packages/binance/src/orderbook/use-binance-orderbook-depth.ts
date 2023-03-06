import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { asReadonly, InstrumentSelector, withMemo } from '@quantform/core';

import {
  Level,
  useBinanceOrderbookDepthSocket
} from './use-binance-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useBinanceOrderbookDepth = withMemo(
  (instrument: InstrumentSelector, level: Level) =>
    useBinanceInstrument(instrument).pipe(
      switchMap(it =>
        it !== instrumentNotSupported
          ? useBinanceOrderbookDepthSocket(it, level)
          : of(instrumentNotSupported)
      ),
      asReadonly(),
      shareReplay(1)
    )
);
