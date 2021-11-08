import {
  AssetSelector,
  BalancePatchEvent,
  AdapterContext,
  Logger,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderFilledEvent,
  OrderLoadEvent,
  OrderPendingEvent,
  AdapterAccountCommand
} from '@quantform/core';
import { fetchBinanceBalance, fetchBinanceOpenOrders } from '../binance-interop';
import { BinanceAdapter } from '../binance.adapter';

function onAccountUpdate(message: any, binance: BinanceAdapter, context: AdapterContext) {
  Logger.debug('onAccountUpdate');
  Logger.debug(message);

  const balance = (message.B as any[]).map(
    it =>
      new BalancePatchEvent(
        new AssetSelector(it.a.toLowerCase(), binance.name),
        parseFloat(it.f),
        parseFloat(it.l),
        context.timestamp
      )
  );

  context.store.dispatch(...balance, ...binance.queuedOrderCompletionEvents);

  binance.queuedOrderCompletionEvents = [];
}

function onOrderUpdate(message: any, binance: BinanceAdapter, context: AdapterContext) {
  Logger.debug('onOrderUpdate');
  Logger.debug(message);

  const clientOrderId = message.C !== '' ? message.C : message.c;
  const order = context.store.snapshot.order.pending[clientOrderId];

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
        context.store.dispatch(new OrderPendingEvent(order.id, context.timestamp));
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
      context.store.dispatch(
        new OrderCancelingEvent(order.id, context.timestamp),
        new OrderCanceledEvent(order.id, context.timestamp)
      );
      break;
  }
}

export async function BinanceAccountHandler(
  command: AdapterAccountCommand,
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  const balances = await fetchBinanceBalance(binance);
  const openOrders = await fetchBinanceOpenOrders(binance, context.store);
  const timestamp = context.timestamp;

  context.store.dispatch(
    ...balances.map(it => new BalancePatchEvent(it.asset, it.free, it.locked, timestamp)),
    ...openOrders.map(it => new OrderLoadEvent(it, timestamp))
  );

  await binance.endpoint.websockets.userData(
    async it => {
      try {
        await onAccountUpdate(it, binance, context);
      } catch (error) {
        Logger.error(error);
      }
    },
    async it => {
      try {
        await onOrderUpdate(it, binance, context);
      } catch (error) {
        Logger.error(error);
      }
    }
  );
}
