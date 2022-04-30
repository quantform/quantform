import { tap } from 'rxjs';
import { Set } from 'typescript-collections';

import { Component, InstrumentSelector, Order, Orderbook, Trade } from '../../../domain';
import { PaperAdapter } from '..';

export abstract class PaperSimulator {
  private readonly pending: Record<string, Set<Order>> = {};

  constructor(readonly adapter: PaperAdapter) {
    this.adapter.store.changes$.pipe(tap(it => this.intercept(it))).subscribe();
  }

  protected abstract onOrderOpened(order: Order);

  protected abstract onOrderCompleted(
    order: Order,
    averageExecutionRate: number,
    timestamp: number
  );

  protected abstract onOrderCanceled(order: Order);

  private intercept(component: Component) {
    if (component instanceof Orderbook) {
      this.pendingOf(component.instrument).forEach(it =>
        this.simulateOrderOnOrderbook(it, component)
      );
    } else if (component instanceof Trade) {
      this.pendingOf(component.instrument).forEach(it =>
        this.simulateOrderOnTrade(it, component)
      );
    }
  }

  private simulateOrderOnOrderbook(order: Order, orderbook: Orderbook) {
    if (orderbook.timestamp <= order.timestamp) {
      return;
    }

    if (order.type == 'MARKET') {
      if (order.quantity > 0 && orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook.timestamp);
      } else if (order.quantity < 0 && orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook.timestamp);
      }

      return;
    }

    if (order.type == 'LIMIT') {
      if (order.quantity > 0 && order.rate >= orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook.timestamp);
      } else if (order.quantity < 0 && order.rate <= orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook.timestamp);
      }

      return;
    }
  }

  private simulateOrderOnTrade(order: Order, trade: Trade) {
    if (trade.timestamp <= order.timestamp) {
      return;
    }

    if (order.type == 'MARKET') {
      this.pendingOf(order.instrument).remove(order);
      this.onOrderCompleted(order, trade.rate, trade.timestamp);

      return;
    }

    if (order.type == 'LIMIT') {
      if (order.quantity > 0 && order.rate > trade.rate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, trade.rate, trade.timestamp);
      } else if (order.quantity < 0 && order.rate < trade.rate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, trade.rate, trade.timestamp);
      }

      return;
    }
  }

  private pendingOf(instrument: InstrumentSelector) {
    let pending = this.pending[instrument.id];
    if (!pending) {
      pending = new Set<Order>();

      this.pending[instrument.id] = pending;
    }

    return pending;
  }

  open(order: Order) {
    const pending = this.pendingOf(order.instrument);

    if (!pending.add(order)) {
      throw new Error('Invalid order');
    }

    this.onOrderOpened(order);
  }

  cancel(order: Order) {
    const pending = this.pendingOf(order.instrument);

    if (!pending.remove(order)) {
      throw new Error('Invalid order');
    }

    this.onOrderCanceled(order);
  }
}
