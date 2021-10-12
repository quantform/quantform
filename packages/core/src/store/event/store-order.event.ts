import { event } from '../../common/topic';
import { timestamp } from '../../common';
import { Order } from '../../domain';
import { State } from '../store.state';
import { StoreEvent } from './store.event';

@event
export class OrderLoadEvent implements StoreEvent {
  type = 'order-load';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}
}

export function OrderLoadEventHandler(event: OrderLoadEvent, state: State) {
  if (event.order.instrument.toString()! in state.subscription.instrument) {
    return;
  }

  if (event.order.state != 'PENDING') {
    throw new Error(`Order is not pending`);
  }

  event.order.timestamp = event.timestamp;

  state.order.pending[event.order.toString()] = event.order;

  return event.order;
}

@event
export class OrderNewEvent implements StoreEvent {
  type = 'order-new';

  constructor(readonly order: Order, readonly timestamp: timestamp) {}
}

export function OrderNewEventHandler(event: OrderNewEvent, state: State) {
  if (event.order.instrument.toString()! in state.subscription.instrument) {
    return;
  }

  if (event.order.state != 'NEW') {
    throw new Error(`Order is not new`);
  }

  event.order.createdAt = event.timestamp;
  event.order.timestamp = event.timestamp;

  state.order.pending[event.order.toString()] = event.order;

  return event.order;
}

@event
export class OrderPendingEvent implements StoreEvent {
  type = 'order-pending';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderPendingEventHandler(event: OrderPendingEvent, state: State) {
  if (event.id! in state.order.pending) {
    return;
  }

  const order = state.order.pending[event.id];

  if (order.state != 'NEW') {
    throw new Error(`Order is not new`);
  }

  order.state = 'PENDING';
  order.timestamp = event.timestamp;

  return order;
}

@event
export class OrderCompletedEvent implements StoreEvent {
  type = 'order-completed';

  constructor(
    readonly id: string,
    readonly averageExecutionRate: number,
    readonly timestamp: timestamp
  ) {}
}

export function OrderCompletedEventHandler(event: OrderCompletedEvent, state: State) {
  if (event.id! in state.order.pending) {
    return;
  }

  const order = state.order.pending[event.id];

  if (order.state != 'PENDING' && order.state != 'CANCELING') {
    throw new Error('Order is not pending');
  }

  order.state = 'COMPLETED';
  order.timestamp = event.timestamp;
  order.quantityExecuted = order.quantity;
  order.averageExecutionRate = event.averageExecutionRate;

  delete state.order.pending[event.id];

  state.order.completed[event.id] = order;

  return order;
}

@event
export class OrderCancelingEvent implements StoreEvent {
  type = 'order-canceling';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCancelingEventHandler(event: OrderCancelingEvent, state: State) {
  if (event.id! in state.order.pending) {
    return;
  }

  const order = state.order.pending[event.id];

  if (order.state == 'CANCELING' || order.state == 'CANCELED') {
    return;
  }

  if (order.state != 'PENDING') {
    throw new Error('Order is not pending');
  }

  order.state = 'CANCELING';
  order.timestamp = event.timestamp;

  return order;
}

@event
export class OrderCanceledEvent implements StoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCanceledEventHandler(event: OrderCanceledEvent, state: State) {
  const order = state.order.pending[event.id];

  if (order.state == 'CANCELED') {
    return;
  }

  if (order.state != 'CANCELING') {
    throw new Error('Order is not canceling');
  }

  order.state = 'CANCELED';
  order.timestamp = event.timestamp;

  delete state.order.pending[event.id];

  state.order.canceled[event.id] = order;

  return order;
}

@event
export class OrderCancelFailedEvent implements StoreEvent {
  type = 'order-cancel-failed';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderCancelFailedEventHandler(
  event: OrderCancelFailedEvent,
  state: State
) {
  const order = state.order.pending[event.id];

  if (order.state != 'CANCELING') {
    return;
  }

  order.state = 'PENDING';
  order.timestamp = event.timestamp;

  return order;
}

@event
export class OrderRejectedEvent implements StoreEvent {
  type = 'order-canceled';

  constructor(readonly id: string, readonly timestamp: timestamp) {}
}

export function OrderRejectedEventHandler(event: OrderRejectedEvent, state: State) {
  const order = state.order.pending[event.id];

  if (order.state != 'NEW') {
    throw new Error('Order is not new.');
  }

  order.state = 'REJECTED';
  order.timestamp = event.timestamp;

  delete state.order.pending[event.id];

  state.order.rejected[event.id] = order;

  return order;
}
