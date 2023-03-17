import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, Instrument, useReplay } from '@quantform/core';

const contract = z.object({
  p: z.string(),
  q: z.string()
});

export function useBinanceTradeSocket(instrument: Instrument) {
  const trade = {
    timestamp: 0,
    instrument,
    rate: d.Zero,
    quantity: d.Zero
  };

  return useReplay(
    useBinanceSocket(contract, `ws/${instrument.raw.toLowerCase()}@trade`),
    [useBinanceTradeSocket.name, instrument.id]
  ).pipe(
    map(({ timestamp, payload }) => {
      trade.timestamp = timestamp;
      trade.quantity = d(payload.q);
      trade.rate = d(payload.p);

      return trade;
    })
  );
}
