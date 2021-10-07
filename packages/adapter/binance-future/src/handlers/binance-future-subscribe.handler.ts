import {
  AdapterContext,
  AdapterSubscribeCommand,
  OrderbookPatchEvent,
  TradePatchEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '../binance-future-adapter';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureSubscribeHandler(
  command: AdapterSubscribeCommand,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  for (const instrument of command.instrument) {
    if (!binanceFuture.subscribed.add(instrument)) {
      continue;
    }

    const symbol = instrumentToBinanceFuture(instrument);

    await binanceFuture.endpoint.futuresAggTradeStream(symbol, message => {
      context.store.dispatch(
        new TradePatchEvent(
          instrument,
          parseFloat(message.price),
          parseFloat(message.amount),
          context.timestamp
        )
      );
    });

    await binanceFuture.endpoint.futuresBookTickerStream(symbol, message =>
      context.store.dispatch(
        new OrderbookPatchEvent(
          instrument,
          parseFloat(message.bestAsk),
          parseFloat(message.bestAskQty),
          parseFloat(message.bestBid),
          parseFloat(message.bestBidQty),
          context.timestamp
        )
      )
    );
  }
}
