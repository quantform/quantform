import { map, of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { useBinanceSocket } from '@lib/use-binance-socket';
import {
  d,
  decimal,
  Instrument,
  InstrumentSelector,
  useReplay,
  useState
} from '@quantform/core';

type Level = `${5 | 10 | 20}@${100 | 1000}ms`;

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookDepth(instrument: InstrumentSelector, level: Level) {
  const [streamer] = useState(
    useBinanceInstrument(instrument).pipe(
      switchMap(it => {
        if (it === instrumentNotSupported) {
          return of(instrumentNotSupported);
        }

        return useBinanceOrderbookDepthSocket(it, level);
      })
    ),
    [useBinanceOrderbookDepth.name, instrument.id, level]
  );

  return streamer;
}

function useBinanceOrderbookDepthSocket(instrument: Instrument, level: Level) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: Array.of<{ quantity: decimal; rate: decimal }>(),
    bids: Array.of<{ quantity: decimal; rate: decimal }>(),
    level
  };

  return useReplay(useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@depth${level}`), [
    useBinanceOrderbookDepthSocket.name,
    instrument.id,
    level
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
    asks: message.asks.map(it => ({ rate: d(it[0]), quantity: d(it[1]) })),
    bids: message.bids.map(it => ({ rate: d(it[0]), quantity: d(it[1]) }))
  };
}
