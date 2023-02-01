import { map, of, shareReplay, switchMap } from 'rxjs';

import { instrumentNotSupported, useBinanceInstrument } from '@lib/instrument';
import { useBinanceSocket } from '@lib/use-binance-socket';
import { d, Instrument, InstrumentSelector, useReplay, useState } from '@quantform/core';

/**
 * Pipes best ask and best bid in realtime.
 */
export function useBinanceOrderbookTicker(instrument: InstrumentSelector) {
  const [streamer] = useState(
    useBinanceInstrument(instrument).pipe(
      switchMap(it => {
        if (it === instrumentNotSupported) {
          return of(instrumentNotSupported);
        }

        return useBinanceOrderbookTickerSocket(it);
      })
    ),
    [useBinanceOrderbookTicker.name, instrument.id]
  );

  return streamer;
}

function useBinanceOrderbookTickerSocket(instrument: Instrument) {
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
