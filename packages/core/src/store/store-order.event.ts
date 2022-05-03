import { InstrumentSelector, Order } from '../domain';
import { timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { InnerSet, State, StateChangeTracker } from './store-state';

export class OrderLoadEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State, changes: StateChangeTracker): void {
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    orderByInstrument.upsert(this.order);
  }
}

export class OrderNewEvent implements StoreEvent {
  constructor(readonly order: Order, readonly timestamp: timestamp) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (this.order.state != 'NEW') {
      throw new Error(`Order is not new`);
    }

    this.order.createdAt = this.timestamp;
    this.order.timestamp = this.timestamp;

    const orderByInstrument = state.order.tryGetOrSet(
      this.order.instrument.id,
      () => new InnerSet<Order>(this.order.instrument.id)
    );

    orderByInstrument.upsert(this.order);

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
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state != 'NEW') {
      throw new Error(`Order is not NEW: ${order.state}`);
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

    changes.commit(order);
  }
}

export class OrderFilledEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: InstrumentSelector,
    readonly averageExecutionRate: number,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const order = state.order
      .tryGetOrSet(this.instrument.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state != 'PENDING' && order.state != 'CANCELING') {
      throw new Error(`Order is not PENDING or CANCELING: ${order.state}`);
    }

    order.state = 'FILLED';
    order.timestamp = this.timestamp;
    order.quantityExecuted = order.quantity;
    order.averageExecutionRate = this.averageExecutionRate;

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
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state == 'CANCELING' || order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'PENDING') {
      throw new Error(`Order is not PENDING: ${order.state}`);
    }

    order.state = 'CANCELING';
    order.timestamp = this.timestamp;

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
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state == 'CANCELED') {
      return;
    }

    if (order.state != 'CANCELING') {
      throw new Error(`Order is not CANCELING: ${order.state}`);
    }

    order.state = 'CANCELED';
    order.timestamp = this.timestamp;

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
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state != 'CANCELING') {
      return;
    }

    order.state = 'PENDING';
    order.timestamp = this.timestamp;

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
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      })
      .tryGetOrSet(this.id, () => {
        throw new Error(`Trying to patch unknown order: ${this.id}`);
      });

    if (order.state != 'NEW') {
      throw new Error(`Order is not NEW: ${order.state}`);
    }

    order.state = 'REJECTED';
    order.timestamp = this.timestamp;

    changes.commit(order);
  }
}
