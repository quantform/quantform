import { of, shareReplay, switchMap } from 'rxjs';

import { InstrumentSelector, useState } from '@quantform/core';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';

import { useBinanceTradeStreamer } from './use-binance-trade-streamer';

export function useBinanceTrade(instrument: InstrumentSelector) {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      const [streamer] = useState(useBinanceTradeStreamer(it).pipe(shareReplay(1)), [
        useBinanceTrade.name,
        it.id
      ]);

      return streamer;
    })
  );
}
