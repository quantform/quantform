import { map } from 'rxjs';
import { z } from 'zod';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, Instrument, useReplay } from '@quantform/core';

export function useBinanceTradeSocket(instrument: Instrument) {
  const trade = {
    timestamp: 0,
    instrument,
    rate: d.Zero,
    quantity: d.Zero
  };

  return useReplay(
    useBinanceSocket(z.any(), `ws/${instrument.raw.toLowerCase()}@trade`),
    [useBinanceTradeSocket.name, instrument.id]
  ).pipe(
    map(({ timestamp, payload }) => {
      const { rate, quantity } = mapBinanceToTrade(payload);

      trade.timestamp = timestamp;
      trade.quantity = quantity;
      trade.rate = rate;

      return trade;
    })
  );
}

function mapBinanceToTrade(message: any) {
  return {
    rate: d(message.p),
    quantity: d(message.q)
  };
}
