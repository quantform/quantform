import { map, switchMap } from 'rxjs';

import { withInstrument } from '@lib/instrument';
import { whenSimulator } from '@lib/simulator/when-simulator';
import { d, InstrumentSelector, withMemo } from '@quantform/core';

import { useBinanceOrderbookTickerSocket } from './use-binance-orderbook-ticker-socket';

function whenBinanceOrderbookTicker(instrument: InstrumentSelector) {
  return withInstrument(instrument).pipe(
    switchMap(it => {
      const ticker = {
        timestamp: 0,
        instrument: it,
        asks: { quantity: d.Zero, rate: d.Zero },
        bids: { quantity: d.Zero, rate: d.Zero }
      };

      return useBinanceOrderbookTickerSocket(it).pipe(
        map(({ timestamp, payload }) => {
          ticker.timestamp = timestamp;
          ticker.asks = { rate: d(payload.a), quantity: d(payload.A) };
          ticker.bids = { rate: d(payload.b), quantity: d(payload.B) };

          return ticker;
        })
      );
    })
  );
}

export type whenOrderbookTickerType = typeof whenBinanceOrderbookTicker;

/**
 * Pipes best ask and best bid in realtime.
 */
export const whenOrderbookTicker = withMemo(
  (...args: Parameters<whenOrderbookTickerType>) =>
    whenSimulator(whenBinanceOrderbookTicker, 'when-orderbook-ticker', args)
);
