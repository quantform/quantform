import {
  timestamp,
  BalanceFreezEvent,
  AdapterContext,
  Logger,
  Order,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  Store
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

export async function BinanceOrderOpenHandler(
  order: Order,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  context.dispatch(
    ...caluclateFreezAllocation(context, order, context.timestamp),
    new OrderNewEvent(order, context.timestamp)
  );

  const instrument = context.snapshot.universe.instrument[order.instrument.toString()];

  let response = null;

  switch (order.type) {
    case 'MARKET':
      switch (order.side) {
        case 'BUY':
          response = await binance.endpoint.marketBuy(
            instrumentToBinance(instrument),
            order.quantity,
            { newClientOrderId: order.id }
          );
          break;
        case 'SELL':
          response = await binance.endpoint.marketSell(
            instrumentToBinance(instrument),
            order.quantity,
            { newClientOrderId: order.id }
          );
          break;
      }
      break;
    case 'LIMIT':
      switch (order.side) {
        case 'BUY':
          response = await binance.endpoint.buy(
            instrumentToBinance(instrument),
            order.quantity,
            order.rate.toFixed(instrument.quote.scale),
            { newClientOrderId: order.id }
          );
          break;
        case 'SELL':
          response = await binance.endpoint.sell(
            instrumentToBinance(instrument),
            order.quantity,
            order.rate.toFixed(instrument.quote.scale),
            { newClientOrderId: order.id }
          );
          break;
      }
      break;
    default:
      throw new Error('order type not supported.');
  }

  Logger.debug(response);

  if (response.msg) {
    context.dispatch(new OrderRejectedEvent(order.id, context.timestamp));
  } else {
    if (!order.externalId) {
      order.externalId = `${response.orderId}`;
    }

    if (response.status == 'NEW') {
      if (order.state != 'PENDING') {
        context.dispatch(new OrderPendingEvent(order.id, context.timestamp));
      }
    }
  }

  function caluclateFreezAllocation(
    context: AdapterContext,
    order: Order,
    timestamp: timestamp
  ): BalanceFreezEvent[] {
    const snapshot = context.snapshot;
    const quote = snapshot.balance[order.instrument.quote.toString()];

    switch (order.side) {
      case 'BUY':
        switch (order.type) {
          case 'MARKET':
            return [new BalanceFreezEvent(order.instrument.quote, quote.free, timestamp)];

          case 'LIMIT':
            return [
              new BalanceFreezEvent(
                order.instrument.quote,
                quote.asset.ceil(order.rate * order.quantity),
                timestamp
              )
            ];
        }
        break;

      case 'SELL':
        return [new BalanceFreezEvent(order.instrument.base, order.quantity, timestamp)];
    }
  }
}
