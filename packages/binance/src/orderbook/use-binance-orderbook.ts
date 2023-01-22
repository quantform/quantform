import { of, shareReplay, switchMap } from 'rxjs';

import { InstrumentSelector, useState } from '@quantform/core';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';

import { useBinanceOrderbookStreamer } from './use-binance-orderbook-streamer';

export function useBinanceOrderbook(instrument: InstrumentSelector) {
  return useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      const [streamer] = useState(useBinanceOrderbookStreamer(it).pipe(shareReplay(1)), [
        useBinanceOrderbook.name,
        it.id
      ]);

      return streamer;
    })
  );
}