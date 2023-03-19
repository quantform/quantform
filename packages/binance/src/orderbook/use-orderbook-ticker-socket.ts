import { map, shareReplay } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { d, Instrument, useReplay } from '@quantform/core';

export function useOrderbookTickerSocket(instrument: Instrument) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: { quantity: d.Zero, rate: d.Zero },
    bids: { quantity: d.Zero, rate: d.Zero }
  };

  return useReplay(
    useReadonlySocket(z.any(), `ws/${instrument.raw.toLowerCase()}@bookTicker`),
    [useOrderbookTickerSocket.name, instrument.id]
  ).pipe(
    map(({ timestamp, payload }) => {
      const { asks, bids } = mapBinanceToOrderbook(payload);

      orderbook.timestamp = timestamp;
      orderbook.asks = asks;
      orderbook.bids = bids;

      return orderbook;
    }),
    shareReplay(1)
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.a), quantity: d(message.A) },
    bids: { rate: d(message.b), quantity: d(message.B) }
  };
}
