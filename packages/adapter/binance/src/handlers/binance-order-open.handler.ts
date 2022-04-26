import {
  AdapterContext,
  BalanceFreezEvent,
  Logger,
  Order,
  OrderNewEvent,
  OrderPendingEvent,
  OrderRejectedEvent,
  timestamp
} from '@quantform/core';

import { BinanceAdapter } from '../binance.adapter';
import { openBinanceOrder } from '../binance-interop';

export async function BinanceOrderOpenHandler(
  order: Order,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  context.dispatch(
    ...caluclateFreezAllocation(context, order, context.timestamp),
    new OrderNewEvent(order, context.timestamp)
  );

  /*const response = await openBinanceOrder(order, binance);

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
  }*/

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
