import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, shareMemo } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookTicker(instrument: InstrumentSelector) {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useBinanceOrderbookTickerSocket(it);
    }),
    shareReplay(1),
    shareMemo([useBinanceOrderbookTicker.name, instrument.id])
  );
}
