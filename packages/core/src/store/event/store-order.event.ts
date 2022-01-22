import { event } from '../../shared/topic';
import { timestamp } from '../../shared';
import { Order } from '../../domain';
import { State, StateChangeTracker } from '../store.state';
import { StoreEvent } from './store.event';

@event
export class OrderLoadEvent implements StoreEvent {
  type = 'order-load';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}
}

export function OrderLoadEventHandler(
  event: OrderLoadEvent,
  state: State,
  changes: StateChangeTracker
) {
  event.order.timestamp = event.timestamp;

  state.order[event.order.id] = event.order;

  changes.commit(event.order);
}

@event
export class OrderNewEvent implements StoreEvent {
  type = 'order-new';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}
}

export function OrderNewEventHandler(
  event: OrderNewEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (event.order.state != 'NEW') {
    throw new Error(`Order is not new`);
  }

  event.order.createdAt = event.timestamp;
  event.order.timestamp = event.timestamp;

  state.order[event.order.id] = event.order;

  changes.commit(event.order);
}

@event
export class OrderPendingEvent implements StoreEvent {
  type = 'order-pending';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderPendingEventHandler(
  event: OrderPendingEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!(event.id in state.order.pending)) {
    throw new Error(`Trying to patch unknown order: ${event.id}`);
  }

  const order = state.order[event.id];

  if (order.state != 'NEW') {
    throw new Error(`Order is not new`);
  }

  order.state = 'PENDING';
  order.timestamp = event.timestamp;

  changes.commit(order);
}

@event
export class OrderFilledEvent implements StoreEvent {
  type = 'order-filled';

  constructor(
    readonly id: string,
    readonly averageExecutionRate: number,
    readonly timestamp: timestamp
  ) {}
}

export function OrderFilledEventHandler(
  event: OrderFilledEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!(event.id in state.order)) {
    throw new Error(`Trying to patch unknown order: ${event.id}`);
  }

  const order = state.order[event.id];

  if (order.state != 'PENDING' && order.state != 'CANCELING') {
    throw new Error('Order is not pending');
  }

  order.state = 'FILLED';
  order.timestamp = event.timestamp;
  order.quantityExecuted = order.quantity;
  order.averageExecutionRate = event.averageExecutionRate;

  changes.commit(order);
}

@event
export class OrderCancelingEvent implements StoreEvent {
  type = 'order-canceling';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCancelingEventHandler(
  event: OrderCancelingEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!(event.id in state.order)) {
    throw new Error(`Trying to patch unknown order: ${event.id}`);
  }

  const order = state.order[event.id];

  if (order.state == 'CANCELING' || order.state == 'CANCELED') {
    return;
  }

  if (order.state != 'PENDING') {
    throw new Error('Order is not pending');
  }

  order.state = 'CANCELING';
  order.timestamp = event.timestamp;

  changes.commit(order);
}

@event
export class OrderCanceledEvent implements StoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCanceledEventHandler(
  event: OrderCanceledEvent,
  state: State,
  changes: StateChangeTracker
) {
  const order = state.order[event.id];

  if (order.state == 'CANCELED') {
    return;
  }

  if (order.state != 'CANCELING') {
    throw new Error('Order is not canceling');
  }

  order.state = 'CANCELED';
  order.timestamp = event.timestamp;

  changes.commit(order);
}

@event
export class OrderCancelFailedEvent implements StoreEvent {
  type = 'order-cancel-failed';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCancelFailedEventHandler(
  event: OrderCancelFailedEvent,
  state: State,
  changes: StateChangeTracker
) {
  const order = state.order[event.id];

  if (order.state != 'CANCELING') {
    return;
  }

  order.state = 'PENDING';
  order.timestamp = event.timestamp;

  changes.commit(order);
}

@event
export class OrderRejectedEvent implements StoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderRejectedEventHandler(
  event: OrderRejectedEvent,
  state: State,
  changes: StateChangeTracker
) {
  const order = state.order[event.id];

  if (order.state != 'NEW') {
    throw new Error('Order is not new.');
  }

  order.state = 'REJECTED';
  order.timestamp = event.timestamp;

  changes.commit(order);
}
