import { Order, Orderbook } from '../../domain';
import {
  BalanceFreezEvent,
  BalanceTransactEvent,
  BalanceUnfreezEvent,
  OrderCanceledEvent,
  OrderCancelingEvent,
  OrderCompletedEvent,
  OrderNewEvent,
  OrderPendingEvent
} from '../../store/event';
import { ExchangePaperTradingAdapter } from '..';
import { ExchangePaperTradingPlatform } from './exchange-paper-trading-platform';
import { timestamp } from '../../common';

export class ExchangePaperTradingPlatformSpot extends ExchangePaperTradingPlatform {
  constructor(readonly adapter: ExchangePaperTradingAdapter) {
    super(adapter);
  }

  onOrderOpened(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(
      ...this.caluclateFreezAllocation(order, timestamp),
      new OrderNewEvent(order, timestamp)
    );
    this.adapter.store.dispatch(new OrderPendingEvent(order.id, timestamp));
  }

  onOrderCompleted(order: Order, averageExecutionRate: number, orderbook: Orderbook) {
    const instrument = this.adapter.store.snapshot.universe.instrument[
      order.instrument.toString()
    ];
    const transacted = {
      base: 0,
      quote: 0
    };

    switch (order.side) {
      case 'BUY':
        transacted.base += instrument.base.floor(
          instrument.commision.applyMakerFee(order.quantity)
        );
        transacted.quote -= instrument.quote.floor(averageExecutionRate * order.quantity);
        break;

      case 'SELL':
        transacted.base -= instrument.base.floor(order.quantity);
        transacted.quote += instrument.quote.floor(
          instrument.commision.applyMakerFee(averageExecutionRate * order.quantity)
        );
        break;
    }

    this.adapter.store.dispatch(
      ...this.caluclateUnfreezAllocation(order, orderbook.timestamp),
      new OrderCompletedEvent(order.id, averageExecutionRate, orderbook.timestamp),
      new BalanceTransactEvent(instrument.base, transacted.base, orderbook.timestamp),
      new BalanceTransactEvent(instrument.quote, transacted.quote, orderbook.timestamp)
    );
  }

  onOrderCanceled(order: Order) {
    const timestamp = this.adapter.timestamp();

    this.adapter.store.dispatch(new OrderCancelingEvent(order.id, timestamp));
    this.adapter.store.dispatch(
      ...this.caluclateUnfreezAllocation(order, timestamp),
      new OrderCanceledEvent(order.id, timestamp)
    );
  }

  private caluclateFreezAllocation(
    order: Order,
    timestamp: timestamp
  ): BalanceFreezEvent[] {
    const snapshot = this.adapter.store.snapshot;
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

  private caluclateUnfreezAllocation(
    order: Order,
    timestamp: timestamp
  ): BalanceUnfreezEvent[] {
    const snapshot = this.adapter.store.snapshot;
    const quote = snapshot.balance[order.instrument.quote.toString()];

    switch (order.side) {
      case 'BUY':
        switch (order.type) {
          case 'MARKET':
            return [
              new BalanceUnfreezEvent(order.instrument.quote, quote.freezed, timestamp)
            ];

          case 'LIMIT':
            return [
              new BalanceUnfreezEvent(
                order.instrument.quote,
                quote.asset.ceil(order.rate * order.quantity),
                timestamp
              )
            ];
        }
        break;

      case 'SELL':
        return [
          new BalanceUnfreezEvent(order.instrument.base, order.quantity, timestamp)
        ];
    }
  }
}
