import { tap } from 'rxjs/operators';
import { Component, InstrumentSelector, Order, Orderbook, Trade } from '../../../domain';
import { PaperAdapter } from '..';
import { Set } from 'typescript-collections';

export abstract class PaperExecutor {
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
    if (order.type == 'MARKET') {
      if (order.side == 'BUY' && orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook.timestamp);
      } else if (order.side == 'SELL' && orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook.timestamp);
      }

      return;
    }

    if (order.type == 'LIMIT') {
      if (order.side == 'BUY' && order.rate >= orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook.timestamp);
      } else if (order.side == 'SELL' && order.rate <= orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook.timestamp);
      }

      return;
    }
  }

  private simulateOrderOnTrade(order: Order, trade: Trade) {
    if (order.type == 'MARKET') {
      this.pendingOf(order.instrument).remove(order);
      this.onOrderCompleted(order, trade.rate, trade.timestamp);

      return;
    }

    if (order.type == 'LIMIT') {
      if (order.side == 'BUY' && order.rate > trade.rate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, trade.rate, trade.timestamp);
      } else if (order.side == 'SELL' && order.rate < trade.rate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, trade.rate, trade.timestamp);
      }

      return;
    }
  }

  private pendingOf(instrument: InstrumentSelector) {
    let pending = this.pending[instrument.toString()];
    if (!pending) {
      pending = new Set<Order>();

      this.pending[instrument.toString()] = pending;
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