import { map, shareReplay } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, decimal, Instrument, useReplay, useState } from '@quantform/core';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookPartial(instrument: Instrument, level: 5 | 10 | 20) {
  const [streamer] = useState(useBinanceOrderbookPartialStreaming(instrument, level), [
    useBinanceOrderbookPartial.name,
    instrument.id,
    level
  ]);

  return streamer;
}

function useBinanceOrderbookPartialStreaming(instrument: Instrument, level: 5 | 10 | 20) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: Array.of<{ quantity: decimal; rate: decimal }>(),
    bids: Array.of<{ quantity: decimal; rate: decimal }>(),
    level
  };

  return useReplay(
    useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@depth${level}@100ms`),
    [useBinanceOrderbookPartialStreaming.name, instrument.id, level]
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
    asks: message.asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) })),
    bids: message.bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }))
  };
}
