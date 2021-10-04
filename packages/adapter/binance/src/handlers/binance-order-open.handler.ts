import {
  timestamp,
  BalanceFreezEvent,
  AdapterContext,
  Logger,
  Order,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  Store,
  AdapterOrderOpenCommand
} from '@quantform/core';
import { instrumentToBinance } from '../binance-interop';
import { BinanceAdapter } from '../binance-adapter';

export async function BinanceOrderOpenHandler(
  command: AdapterOrderOpenCommand,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  context.store.dispatch(
    ...caluclateFreezAllocation(context.store, command.order, context.timestamp),
    new OrderNewEvent(command.order, context.timestamp)
  );

  const instrument =
    context.store.snapshot.universe.instrument[command.order.instrument.toString()];

  let response = null;

  switch (command.order.type) {
    case 'MARKET':
      switch (command.order.side) {
        case 'BUY':
          response = await binance.endpoint.marketBuy(
            instrumentToBinance(instrument),
            command.order.quantity,
            { newClientOrderId: command.order.id }
          );
          break;
        case 'SELL':
          response = await binance.endpoint.marketSell(
            instrumentToBinance(instrument),
            command.order.quantity,
            { newClientOrderId: command.order.id }
          );
          break;
      }
      break;
    case 'LIMIT':
      switch (command.order.side) {
        case 'BUY':
          response = await binance.endpoint.buy(
            instrumentToBinance(instrument),
            command.order.quantity,
            command.order.rate.toFixed(instrument.quote.scale),
            { newClientOrderId: command.order.id }
          );
          break;
        case 'SELL':
          response = await binance.endpoint.sell(
            instrumentToBinance(instrument),
            command.order.quantity,
            command.order.rate.toFixed(instrument.quote.scale),
            { newClientOrderId: command.order.id }
          );
          break;
      }
      break;
    default:
      throw new Error('order type not supported.');
  }

  Logger.debug(response);

  if (response.msg) {
    context.store.dispatch(new OrderRejectedEvent(command.order.id, context.timestamp));
  } else {
    if (!command.order.externalId) {
      command.order.externalId = `${response.orderId}`;
    }

    if (response.status == 'NEW') {
      if (command.order.state != 'PENDING') {
        context.store.dispatch(
          new OrderPendingEvent(command.order.id, context.timestamp)
        );
      }
    }
  }

  function caluclateFreezAllocation(
    store: Store,
    order: Order,
    timestamp: timestamp
  ): BalanceFreezEvent[] {
    const snapshot = store.snapshot;
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
