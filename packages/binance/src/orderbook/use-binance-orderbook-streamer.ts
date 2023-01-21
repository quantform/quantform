import { map } from 'rxjs';

import { d, Instrument } from '@quantform/core';

import { useBinanceConnectorOrderbook } from '@lib/use-binance-connector-orderbook';

export function useBinanceOrderbookStreamer(instrument: Instrument) {
  const orderbook = {
    timestamp: 0,
    instrument,
    asks: { quantity: d.Zero, rate: d.Zero, next: undefined },
    bids: { quantity: d.Zero, rate: d.Zero, next: undefined }
  };

  return useBinanceConnectorOrderbook(instrument).pipe(
    map(({ timestamp, payload }) => {
      const { asks, bids } = mapBinanceToOrderbook(payload);

      orderbook.timestamp = timestamp;
      orderbook.asks = asks;
      orderbook.bids = bids;

      return orderbook;
    })
  );
}

function mapBinanceToOrderbook(message: any) {
  return {
    asks: { rate: d(message.bestAsk), quantity: d(message.bestAskQty), next: undefined },
    bids: { rate: d(message.bestBid), quantity: d(message.bestBidQty), next: undefined }
  };
}
