import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, useMemo } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

export function useBinanceTrade(instrument: InstrumentSelector) {
  return useMemo(
    () =>
      useBinanceInstrument(instrument).pipe(
        switchMap(it => {
          if (it === instrumentNotSupported) {
            return of(instrumentNotSupported);
          }

          return useBinanceTradeSocket(it);
        }),
        shareReplay(1)
      ),
    [useBinanceTrade.name, instrument.id]
  );
}
