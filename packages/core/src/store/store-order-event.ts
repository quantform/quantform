import { Balance, InstrumentSelector, invalidArgumentError, Order } from '../domain';
import { d, decimal, timestamp } from '../shared';
import {
  balanceNotFoundError,
  orderInvalidStateError,
  orderNotFoundError
} from './error';
import { StoreEvent } from './store-event';
import { InnerSet, State, StateChangeTracker } from './store-state';

function updateOrder(order: Order, state: State): Balance {
  if (order.quantity.greaterThan(d.Zero)) {
    const quote = state.balance.get(order.instrument.quote.id);

    if (!quote) {
      throw balanceNotFoundError(order.instrument.quote);
    }

    quote.updateByOrder(order);

    return quote;
  }

  if (order.quantity.lessThan(d.Zero)) {
    const base = state.balance.get(order.instrument.base.id);

    if (!base) {
      throw balanceNotFoundError(order.instrument.base);
    }

    base.updateByOrder(order);

    return base;
  }

  throw invalidArgumentError(order);
}

/**
 * Patches a store with an existing pending order.
 * No store changing events are propagated.
 */
export class OrderLoadEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State): void {
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    updateOrder(this.order, state);

    orderByInstrument.upsert(this.order);
  }
}

export class OrderNewEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (this.order.state != 'NEW') {
      throw orderInvalidStateError(this.order.state, ['NEW']);
    }

    this.order.createdAt = this.timestamp;
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    orderByInstrument.upsert(this.order);
    const balance = updateOrder(this.order, state);

    changes.commit(balance);
    changes.commit(this.order);
  }
}

export class OrderPendingEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state != 'NEW') {
      throw orderInvalidStateError(order.state, ['NEW']);
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}

export class OrderFilledEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly averageExecutionRate: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state != 'PENDING' && order.state != 'CANCELING') {
      throw orderInvalidStateError(order.state, ['PENDING', 'CANCELING']);
    }

    order.state = 'FILLED';
    order.timestamp = this.timestamp;
    order.quantityExecuted = order.quantity;
    order.averageExecutionRate = this.averageExecutionRate;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}

export class OrderCancelingEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state == 'CANCELING' || order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'PENDING') {
      throw orderInvalidStateError(order.state, ['PENDING']);
    }

    order.state = 'CANCELING';
    order.timestamp = this.timestamp;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}

export class OrderCanceledEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'CANCELING') {
      throw orderInvalidStateError(order.state, ['CANCELING']);
    }

    order.state = 'CANCELED';
    order.timestamp = this.timestamp;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}

export class OrderCancelFailedEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state != 'CANCELING') {
      return;
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}

export class OrderRejectedEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw orderNotFoundError(this.id);
      })
      .tryGetOrSet(this.id, () => {
        throw orderNotFoundError(this.id);
      });

    if (order.state != 'NEW') {
      throw orderInvalidStateError(order.state, ['NEW']);
    }

    order.state = 'REJECTED';
    order.timestamp = this.timestamp;

    const balance = updateOrder(order, state);

    changes.commit(balance);
    changes.commit(order);
  }
}
