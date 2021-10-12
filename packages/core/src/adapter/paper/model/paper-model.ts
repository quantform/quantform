import { tap } from 'rxjs/operators';
import { Component, InstrumentSelector, Order, Orderbook } from '../../../domain';
import { PaperAdapter } from '..';
import { Set } from 'typescript-collections';

export abstract class PaperModel {
  private readonly pending: Record<string, Set<Order>> = {};

  constructor(readonly adapter: PaperAdapter) {
    this.adapter.store.changes$.pipe(tap(it => this.intercept(it))).subscribe();
  }

  protected abstract onOrderOpened(order: Order);

  protected abstract onOrderCompleted(
    order: Order,
    averageExecutionRate: number,
    orderbook: Orderbook
  );

  protected abstract onOrderCanceled(order: Order);

  private intercept(component: Component) {
    if (component instanceof Orderbook) {
      this.orderbook(component);
    }
  }

  protected orderbook(component: Orderbook) {
    const pending = this.pendingOf(component.instrument);

    if (pending.size() == 0) {
      return;
    }

    pending.forEach(it => this.simulateOrder(it, component));
  }

  private simulateOrder(order: Order, orderbook: Orderbook) {
    if (order.type == 'MARKET') {
      if (order.side == 'BUY' && orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook);
      } else if (order.side == 'SELL' && orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook);
      }

      return;
    }

    if (order.type == 'LIMIT') {
      if (order.side == 'BUY' && order.rate >= orderbook.bestAskRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestAskRate, orderbook);
      } else if (order.side == 'SELL' && order.rate <= orderbook.bestBidRate) {
        this.pendingOf(order.instrument).remove(order);
        this.onOrderCompleted(order, orderbook.bestBidRate, orderbook);
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
