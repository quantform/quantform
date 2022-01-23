import {
  AdapterContext,
  InstrumentSelector,
  InstrumentSubscriptionEvent,
  OrderbookPatchEvent,
  TradePatchEvent
} from '@quantform/core';
import { BinanceFutureAdapter } from '../binance-future-adapter';
import { instrumentToBinanceFuture } from '../binance-future-interop';

export async function BinanceFutureSubscribeHandler(
  instruments: InstrumentSelector[],
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  for (const instrument of instruments) {
    if (!binanceFuture.subscribed.add(instrument)) {
      continue;
    }

    context.dispatch(
      new InstrumentSubscriptionEvent(context.timestamp, instrument, true)
    );

    const symbol = instrumentToBinanceFuture(instrument);

    await binanceFuture.endpoint.futuresAggTradeStream(symbol, message => {
      context.dispatch(
        new TradePatchEvent(
          instrument,
          parseFloat(message.price),
          parseFloat(message.amount),
          context.timestamp
        )
      );
    });

    await binanceFuture.endpoint.futuresBookTickerStream(symbol, message =>
      context.dispatch(
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
