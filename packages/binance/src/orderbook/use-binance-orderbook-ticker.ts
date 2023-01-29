import { map, shareReplay } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, Instrument, useReplay, useState } from '@quantform/core';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookTicker(instrument: Instrument) {
  const [streamer] = useState(useBinanceOrderbookTickerStreaming(instrument), [
    useBinanceOrderbookTicker.name,
    instrument.id
  ]);

  return streamer;
}

function useBinanceOrderbookTickerStreaming(instrument: Instrument) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: { quantity: d.Zero, rate: d.Zero },
    bids: { quantity: d.Zero, rate: d.Zero }
  };

  return useReplay(useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@bookTicker`), [
    useBinanceOrderbookTickerStreaming.name,
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
