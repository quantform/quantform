import { map } from 'rxjs';
import { z } from 'zod';

import { useReadonlySocket } from '@lib/use-readonly-socket';
import { d, Instrument, use, useReplay } from '@quantform/core';

const messageType = z.object({
  p: z.string(),
  q: z.string(),
  t: z.number(),
  b: z.number(),
  a: z.number(),
  m: z.boolean()
});

export const useTradeSocket = use((instrument: Instrument) => {
  const trade = {
    timestamp: 0,
    instrument,
    rate: d.Zero,
    quantity: d.Zero,
    buyerOrderId: 0,
    sellerOrderId: 0,
    isBuyerMarketMaker: false
  };

  return useReplay(
    useReadonlySocket(messageType, `ws/${instrument.raw.toLowerCase()}@trade`),
    ['trade', instrument.id]
  ).pipe(
    map(({ timestamp, payload }) => {
      trade.timestamp = timestamp;
      trade.quantity = d(payload.q);
      trade.rate = d(payload.p);
      trade.buyerOrderId = payload.b;
      trade.sellerOrderId = payload.a;
      trade.isBuyerMarketMaker = payload.m;

      return trade;
    })
  );
});
