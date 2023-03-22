import { map } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { d, Instrument, use, useReplay } from '@quantform/core';

const messageType = z.object({
  a: z.string(),
  A: z.string(),
  b: z.string(),
  B: z.string()
});

export const useOrderbookTickerSocket = use((instrument: Instrument) => {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: { quantity: d.Zero, rate: d.Zero },
    bids: { quantity: d.Zero, rate: d.Zero }
  };

  return useReplay(
    useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@bookTicker`),
    [instrument.id, 'orderbook-ticker']
  ).pipe(
    map(({ timestamp, payload }) => {
      orderbook.timestamp = timestamp;
      orderbook.asks = { rate: d(payload.a), quantity: d(payload.A) };
      orderbook.bids = { rate: d(payload.b), quantity: d(payload.B) };

      return orderbook;
    })
  );
});
