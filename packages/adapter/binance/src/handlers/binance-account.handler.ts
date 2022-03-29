import {
  AdapterContext,
  AssetSelector,
  BalancePatchEvent,
  Logger,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderLoadEvent,
  OrderPendingEvent
} from '@quantform/core';

import { BinanceAdapter } from '../binance.adapter';
import { fetchBinanceBalance, fetchBinanceOpenOrders } from '../binance-interop';

function onOutboundAccountPosition(
  message: any,
  binance: BinanceAdapter,
  context: AdapterContext
) {
  const balance = message.B?.map(
    it =>
      new BalancePatchEvent(
        new AssetSelector(it.a.toLowerCase(), binance.name),
        parseFloat(it.f),
        parseFloat(it.l),
        context.timestamp
      )
  );

  context.dispatch(...balance, ...binance.queuedOrderCompletionEvents);

  binance.queuedOrderCompletionEvents = [];
}

function onExecutionReport(
  message: any,
  binance: BinanceAdapter,
  context: AdapterContext
) {
  const clientOrderId = message.C !== '' ? message.C : message.c;
  const order = context.snapshot.order[clientOrderId];

  if (!order) {
    Logger.log('received unknown order');
    return;
  }

  if (!order.externalId) {
    order.externalId = `${message.i}`;
  }

  const averagePrice =
    message.o == 'LIMIT'
      ? parseFloat(message.p)
      : parseFloat(message.Z) / parseFloat(message.z);

  switch (message.X) {
    case 'NEW':
    case 'PARTIALLY_FILLED':
    case 'TRADE':
      if (order.state != 'PENDING') {
        context.dispatch(new OrderPendingEvent(order.id, context.timestamp));
      }
      break;
    case 'FILLED':
      binance.queuedOrderCompletionEvents.push(
        new OrderFilledEvent(order.id, averagePrice, context.timestamp)
      );
      break;
    case 'EXPIRED':
    case 'REJECTED':
    case 'CANCELED':
      context.dispatch(
        new OrderCancelingEvent(order.id, context.timestamp),
        new OrderCanceledEvent(order.id, context.timestamp)
      );
      break;
  }
}

export async function BinanceAccountHandler(
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  const balances = await fetchBinanceBalance(binance);
  const openOrders = await fetchBinanceOpenOrders(binance, context);
  const timestamp = context.timestamp;

  context.dispatch(
    ...balances.map(it => new BalancePatchEvent(it.asset, it.free, it.locked, timestamp)),
    ...openOrders.map(it => new OrderLoadEvent(it, timestamp))
  );

  const handler = (message: any) => {
    switch (message.e) {
      case 'executionReport':
        onExecutionReport(message, binance, context);
        break;
      case 'outboundAccountPosition':
        onOutboundAccountPosition(message, binance, context);
        break;
      default:
        throw new Error('Unsupported event type.');
    }
  };

  await binance.endpoint.websockets.userData(
    it => {
      try {
        handler(it);
      } catch (error) {
        Logger.error(error, it);
      }
    },
    it => {
      try {
        handler(it);
      } catch (error) {
        Logger.error(error, it);
      }
    }
  );
}
