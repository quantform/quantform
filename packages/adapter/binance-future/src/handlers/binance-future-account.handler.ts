import {
  AssetSelector,
  BalancePatchEvent,
  AdapterAccountRequest,
  AdapterContext,
  AdapterHandler,
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
  Store
} from '@quantform/core';
import { BinanceFutureAdapter } from '..';

export class BinanceFutureAccountHandler
  implements AdapterHandler<AdapterAccountRequest, void> {
  constructor(private readonly adapter: BinanceFutureAdapter) {}

  async handle(
    request: AdapterAccountRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    await this.fetchAccount(store, context);
    await this.fetchOpenOrders(store, context);

    await this.adapter.endpoint.useServerTime();
    await this.adapter.endpoint.websockets.userFutureData(
      it => this.onMarginCall(it),
      it => this.onAccountUpdate(it, store, context),
      it => this.onOrderUpdate(it, store, context)
    );
  }

  private onMarginCall(message: any) {
    Logger.log('onMarginCall');
    Logger.log(message);
  }

  private onAccountUpdate(message: any, store: Store, context: AdapterContext) {
    Logger.log('onAccountUpdate');

    for (const payload of message.updateData.balances as any[]) {
      store.dispatch(
        new BalancePatchEvent(
          new AssetSelector(payload.asset.toLowerCase(), context.name),
          parseFloat(payload.walletBalance),
          null,
          context.timestamp()
        )
      );
    }

    for (const payload of message.updateData.positions as any[]) {
      const instrument = Object.values(store.snapshot.universe.instrument).find(
        it => it.base.exchange == this.adapter.name && it.raw == payload.symbol
      );

      store.dispatch(
        new PositionPatchEvent(
          `${payload.symbol}-${payload.positionSide}`,
          instrument,
          parseFloat(payload.entryPrice),
          parseFloat(payload.positionAmount),
          parseInt(payload.leverage),
          'CROSS',
          context.timestamp()
        )
      );
    }
  }

  private onOrderUpdate(message: any, store: Store, context: AdapterContext) {
    Logger.log('onOrderUpdate');

    const payload = message.order;
    const order = store.snapshot.order.pending[payload.clientOrderId];

    if (!order) {
      Logger.log('received unknown order');

      return;
    }

    switch (payload.orderStatus) {
      case 'NEW':
      case 'PARTIALLY_FILLED':
      case 'TRADE':
        if (order.state != 'PENDING') {
          store.dispatch(new OrderPendingEvent(order.id, context.timestamp()));
        }
        break;
      case 'FILLED':
        store.dispatch(
          new OrderCompletedEvent(
            order.id,
            parseFloat(payload.averagePrice),
            context.timestamp()
          )
        );
        break;
      case 'EXPIRED':
      case 'REJECTED':
      case 'CANCELED':
        store.dispatch(
          new OrderCancelingEvent(order.id, context.timestamp()),
          new OrderCanceledEvent(order.id, context.timestamp())
        );
        break;
    }
  }

  private async fetchAccount(store: Store, context: AdapterContext): Promise<void> {
    const account = await retry<any>(() => this.adapter.endpoint.futuresAccount());

    for (const payload of account.assets as any[]) {
      store.dispatch(
        new BalancePatchEvent(
          new AssetSelector(payload.asset.toLowerCase(), context.name),
          parseFloat(payload.walletBalance),
          0,
          context.timestamp()
        )
      );
    }

    for (const payload of account.positions as any[]) {
      const instrument = Object.values(store.snapshot.universe.instrument).find(
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

      store.dispatch(new PositionLoadEvent(position, context.timestamp()));
    }
  }

  private async fetchOpenOrders(store: Store, context: AdapterContext): Promise<void> {
    for (const pending of await retry<any>(() =>
      this.adapter.endpoint.futuresOpenOrders()
    )) {
      const instrument = Object.values(store.snapshot.universe.instrument).find(
        it =>
          it.base.exchange == this.adapter.name &&
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

      store.dispatch(new OrderLoadEvent(order, context.timestamp()));
    }
  }
}
