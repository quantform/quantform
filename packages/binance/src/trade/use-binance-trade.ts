import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceTradeSocket } from './use-binance-trade-socket';

export const useBinanceTrade = withMemo((instrument: InstrumentSelector) =>
  useBinanceInstrument(instrument).pipe(
    switchMap(it => {
      if (it === instrumentNotSupported) {
        return of(instrumentNotSupported);
      }

      return useBinanceTradeSocket(it);
    }),
    shareReplay(1)
  )
);
