import { map, shareReplay } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, Instrument, useReplay } from '@quantform/core';

export function useBinanceOrderbookTickerSocket(instrument: Instrument) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: { quantity: d.Zero, rate: d.Zero },
    bids: { quantity: d.Zero, rate: d.Zero }
  };

  return useReplay(useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@bookTicker`), [
    useBinanceOrderbookTickerSocket.name,
    instrument.id
  ]).pipe(
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
