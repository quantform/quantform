import { combineLatest, map } from 'rxjs';

import { useBinanceOrderbookTicker } from '@quantform/binance';
import { InstrumentSelector, notFound } from '@quantform/core';

export function useOrderbookCross(
  x: InstrumentSelector,
  y: InstrumentSelector,
  z: InstrumentSelector
) {
  return combineLatest([
    useBinanceOrderbookTicker(x),
    useBinanceOrderbookTicker(y),
    useBinanceOrderbookTicker(z)
  ]).pipe(
    map(([x, y, z]) => {
      if (x === notFound || y === notFound || z === notFound) {
        return undefined;
      }

      return {
        timestamp: Math.max(x.timestamp, y.timestamp, z.timestamp),
        x: { quantity: x.bids.quantity, rate: x.bids.rate, instrument: x.instrument },
        y: { quantity: y.bids.quantity, rate: y.bids.rate, instrument: y.instrument },
        z: { quantity: z.asks.quantity, rate: z.asks.rate, instrument: z.instrument }
      };
    })
  );
}
