import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, shareMemo } from '@quantform/core';

import {
  Level,
  useBinanceOrderbookDepthSocket
} from './use-binance-orderbook-depth-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookDepth(instrument: InstrumentSelector, level: Level) {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useBinanceOrderbookDepthSocket(it, level);
    }),
    shareReplay(1),
    shareMemo([useBinanceOrderbookDepth.name, instrument.id, level])
  );
}
