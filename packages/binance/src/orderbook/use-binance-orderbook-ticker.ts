import { of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { asReadonly, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

/**
 * Pipes best ask and best bid in realtime.
 */
export const useBinanceOrderbookTicker = withMemo((instrument: InstrumentSelector) =>
  useBinanceInstrument(instrument).pipe(
    switchMap(it =>
      it !== instrumentNotSupported
        ? useBinanceOrderbookTickerSocket(it)
        : of(instrumentNotSupported)
    ),
    asReadonly(),
    shareReplay(1)
  )
);
