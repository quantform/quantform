import { of, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, useMemo } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookTicker(instrument: InstrumentSelector) {
  const ticker = useMemo(
    () =>
      useBinanceInstrument(instrument).pipe(
        switchMap(it => {
          if (it === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          return useBinanceOrderbookTickerSocket(it);
        })
      ),
    [useBinanceOrderbookTicker.name, instrument.id]
  );

  return ticker;
}
