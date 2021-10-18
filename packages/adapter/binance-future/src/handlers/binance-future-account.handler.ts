import {
  AssetSelector,
  BalancePatchEvent,
  AdapterContext,
  Logger,
  Order,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderCompletedEvent,
  OrderLoadEvent,
  OrderPendingEvent,
  Position,
  PositionLoadEvent,
  PositionPatchEvent,
  retry,
  AdapterAccountCommand
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';

export async function BinanceFutureAccountHandler(
  command: AdapterAccountCommand,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  await fetchAccount(context, binanceFuture);
  await fetchOpenOrders(context, binanceFuture);

  await binanceFuture.endpoint.useServerTime();
  await binanceFuture.endpoint.websockets.userFutureData(
    it => onMarginCall(it),
    it => onAccountUpdate(it, context, binanceFuture),
    it => onOrderUpdate(it, context, binanceFuture)
  );
}

function onMarginCall(message: any) {
  Logger.log('onMarginCall');
  Logger.log(message);
}

function onAccountUpdate(
  message: any,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
) {
  Logger.log('onAccountUpdate');

  for (const payload of message.updateData.balances as any[]) {
    context.store.dispatch(
      new BalancePatchEvent(
        new AssetSelector(payload.asset.toLowerCase(), binanceFuture.name),
        parseFloat(payload.walletBalance),
        null,
        context.timestamp
      )
    );
  }

  for (const payload of message.updateData.positions as any[]) {
    const instrument = Object.values(context.store.snapshot.universe.instrument).find(
      it => it.base.exchange == binanceFuture.name && it.raw == payload.symbol
    );

    context.store.dispatch(
      new PositionPatchEvent(
        `${payload.symbol}-${payload.positionSide}`,
        instrument,
        parseFloat(payload.entryPrice),
        parseFloat(payload.positionAmount),
        parseInt(payload.leverage),
        'CROSS',
        context.timestamp
      )
    );
  }
}

function onOrderUpdate(
  message: any,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
) {
  Logger.log('onOrderUpdate');

  const payload = message.order;
  const order = context.store.snapshot.order.pending[payload.clientOrderId];

  if (!order) {
    Logger.log('received unknown order');

    return;
  }

  switch (payload.orderStatus) {
    case 'NEW':
    case 'PARTIALLY_FILLED':
    case 'TRADE':
      if (order.state != 'PENDING') {
        context.store.dispatch(new OrderPendingEvent(order.id, context.timestamp));
      }
      break;
    case 'FILLED':
      context.store.dispatch(
        new OrderCompletedEvent(
          order.id,
          parseFloat(payload.averagePrice),
          context.timestamp
        )
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

async function fetchAccount(
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  const account = await retry<any>(() => binanceFuture.endpoint.futuresAccount());

  for (const payload of account.assets as any[]) {
    context.store.dispatch(
      new BalancePatchEvent(
        new AssetSelector(payload.asset.toLowerCase(), binanceFuture.name),
        parseFloat(payload.walletBalance),
        0,
        context.timestamp
      )
    );
  }

  for (const payload of account.positions as any[]) {
    const instrument = Object.values(context.store.snapshot.universe.instrument).find(
      it => it.raw == payload.symbol
    );

    if (!instrument) {
      continue;
    }

    const position = new Position(
      `${payload.symbol}-${payload.positionSide}`,
      instrument
    );

    position.averageExecutionRate = parseFloat(payload.entryPrice);
    position.size = parseFloat(payload.positionAmt);
    position.leverage = parseInt(payload.leverage);
    position.mode = 'CROSS';

    context.store.dispatch(new PositionLoadEvent(position, context.timestamp));
  }
}

async function fetchOpenOrders(
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  for (const pending of await retry<any>(() =>
    binanceFuture.endpoint.futuresOpenOrders()
  )) {
    const instrument = Object.values(context.store.snapshot.universe.instrument).find(
      it =>
        it.base.exchange == binanceFuture.name &&
        pending.symbol == `${it.base.name.toUpperCase()}${it.quote.name.toUpperCase()}`
    );

    const order = new Order(
      instrument,
      pending.side,
      pending.type,
      parseFloat(pending.origQty),
      parseFloat(pending.price)
    );

    order.id = pending.clientOrderId;
    order.externalId = `${pending.orderId}`;
    order.state = 'PENDING';
    order.createdAt = pending.time;

    context.store.dispatch(new OrderLoadEvent(order, context.timestamp));
  }
}
