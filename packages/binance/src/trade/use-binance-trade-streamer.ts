import { map } from 'rxjs';

import { d, Instrument, useReplay } from '@quantform/core';

import { useBinanceConnectorTrade } from '@lib/use-binance-connector-trade';

export function useBinanceTradeStreamer(instrument: Instrument) {
  const trade = {
    timestamp: 0,
    instrument,
    rate: d.Zero,
    quantity: d.Zero
  };

  return useReplay(useBinanceConnectorTrade(instrument), [
    useBinanceTradeStreamer.name,
    instrument.id
  ]).pipe(
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
