import {
  AssetSelector,
  BalancePatchEvent,
  ExchangeAccountRequest,
  ExchangeAdapterContext,
  ExchangeAdapterHandler,
  ExchangeStoreEvent,
  Logger,
  Order,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderCompletedEvent,
  OrderLoadEvent,
  OrderPendingEvent,
  retry,
  Store
} from '@quantform/core';
import { ExchangeBinanceAdapter } from '../exchange-binance-adapter';

export class ExchangeBinanceAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void>
{
  private queue: ExchangeStoreEvent[] = [];

  constructor(private readonly adapter: ExchangeBinanceAdapter) {}

  async handle(
    request: ExchangeAccountRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    await this.fetchAccount(store, context);
    await this.fetchOpenOrders(store, context);

    await this.adapter.endpoint.websockets.userData(
      async it => {
        try {
          await this.onAccountUpdate(it, store, context);
        } catch (error) {
          Logger.error(error);
        }
      },
      async it => {
        try {
          await this.onOrderUpdate(it, store, context);
        } catch (error) {
          Logger.error(error);
        }
      }
    );
  }

  private onAccountUpdate(message: any, store: Store, context: ExchangeAdapterContext) {
    Logger.debug('onAccountUpdate');
    Logger.debug(message);

    const balance = (message.B as any[]).map(
      it =>
        new BalancePatchEvent(
          new AssetSelector(it.a.toLowerCase(), context.name),
          parseFloat(it.f),
          parseFloat(it.l),
          context.timestamp()
        )
    );

    store.dispatch(...balance, ...this.queue);

    this.queue = [];
  }

  private onOrderUpdate(message: any, store: Store, context: ExchangeAdapterContext) {
    Logger.debug('onOrderUpdate');
    Logger.debug(message);

    const clientOrderId = message.C !== '' ? message.C : message.c;
    const order = store.snapshot.order.pending[clientOrderId];

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
          store.dispatch(new OrderPendingEvent(order.id, context.timestamp()));
        }
        break;
      case 'FILLED':
        this.queue.push(
          new OrderCompletedEvent(order.id, averagePrice, context.timestamp())
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

  private async fetchAccount(
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    const account = await retry<any>(() => this.adapter.endpoint.account());

    for (const balance of account.balances as any[]) {
      const free = parseFloat(balance.free);
      const locked = parseFloat(balance.locked);

      if (free <= 0 && locked <= 0) {
        continue;
      }

      store.dispatch(
        new BalancePatchEvent(
          new AssetSelector(balance.asset.toLowerCase(), context.name),
          free,
          locked,
          context.timestamp()
        )
      );
    }
  }

  private async fetchOpenOrders(
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    for (const pending of await retry<any>(() => this.adapter.endpoint.openOrders())) {
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
