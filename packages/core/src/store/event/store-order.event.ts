import { timestamp } from '../../common';
import { Component, Order } from '../../domain';
import { State } from '../store.state';
import { ExchangeStoreEvent } from './store.event';

export class OrderLoadEvent implements ExchangeStoreEvent {
  type = 'order-load';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return this.order.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    if (this.order.state != 'PENDING') {
      throw new Error(`Order is not pending`);
    }

    this.order.timestamp = this.timestamp;

    state.order.pending[this.order.toString()] = this.order;

    return this.order;
  }
}

export class OrderNewEvent implements ExchangeStoreEvent {
  type = 'order-new';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return this.order.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    if (this.order.state != 'NEW') {
      throw new Error(`Order is not new`);
    }

    this.order.createdAt = this.timestamp;
    this.order.timestamp = this.timestamp;

    state.order.pending[this.order.toString()] = this.order;

    return this.order;
  }
}

export class OrderPendingEvent implements ExchangeStoreEvent {
  type = 'order-pending';

  constructor(readonly id: string, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return this.id in state.order.pending;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state != 'NEW') {
      throw new Error(`Order is not new`);
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    return order;
  }
}

export class OrderCompletedEvent implements ExchangeStoreEvent {
  type = 'order-completed';

  constructor(
    readonly id: string,
    readonly averageExecutionRate: number,
    readonly timestamp: timestamp
  ) {}

  applicable(state: State): boolean {
    return this.id in state.order.pending;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state != 'PENDING' && order.state != 'CANCELING') {
      throw new Error('Order is not pending');
    }

    order.state = 'COMPLETED';
    order.timestamp = this.timestamp;
    order.quantityExecuted = order.quantity;
    order.averageExecutionRate = this.averageExecutionRate;

    delete state.order.pending[this.id];

    state.order.completed[this.id] = order;

    return order;
  }
}

export class OrderCancelingEvent implements ExchangeStoreEvent {
  type = 'order-canceling';

  constructor(readonly id: string, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return this.id in state.order.pending;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state == 'CANCELING' || order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'PENDING') {
      throw new Error('Order is not pending');
    }

    order.state = 'CANCELING';
    order.timestamp = this.timestamp;

    return order;
  }
}

export class OrderCanceledEvent implements ExchangeStoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'CANCELING') {
      throw new Error('Order is not canceling');
    }

    order.state = 'CANCELED';
    order.timestamp = this.timestamp;

    delete state.order.pending[this.id];

    state.order.canceled[this.id] = order;

    return order;
  }
}

export class OrderCancelFailedEvent implements ExchangeStoreEvent {
  type = 'order-cancel-failed';

  constructor(readonly id: string, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state != 'CANCELING') {
      return;
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    return order;
  }
}

export class OrderRejectedEvent implements ExchangeStoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return true;
  }

  execute(state: State): Component | Component[] {
    const order = state.order.pending[this.id];

    if (order.state != 'NEW') {
      throw new Error('Order is not new.');
    }

    order.state = 'REJECTED';
    order.timestamp = this.timestamp;

    delete state.order.pending[this.id];

    state.order.rejected[this.id] = order;

    return order;
  }
}
