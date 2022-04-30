import { Instrument, Position, PositionMode } from '../../domain';
import { timestamp } from '../../shared';
import { event } from '../../shared/topic';
import { State, StateChangeTracker } from '../store-state';
import { StoreEvent } from './store.event';

@event
export class PositionLoadEvent implements StoreEvent {
  type = 'position-load';

  constructor(readonly position: Position, readonly timestamp: timestamp) {}
}

export function PositionLoadEventHandler(
  event: PositionLoadEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!state.subscription.instrument.get(event.position.instrument.id)) {
    throw new Error(
      `Trying to patch unsubscribed instrument: ${event.position.instrument.id}`
    );
  }

  event.position.timestamp = event.timestamp;

  const balance = state.balance.get(event.position.instrument.quote.id);
  const orderbook = state.orderbook.get(event.position.instrument.id);

  balance.position[event.position.id] = event.position;

  if (orderbook) {
    const rate = event.position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

    event.position.calculateEstimatedUnrealizedPnL(rate);
  }

  return event.position;
}

@event
export class PositionPatchEvent implements StoreEvent {
  type = 'position-patch';

  constructor(
    readonly id: string,
    readonly instrument: Instrument,
    readonly rate: number,
    readonly size: number,
    readonly leverage: number,
    readonly mode: PositionMode,
    readonly timestamp: timestamp
  ) {}
}

export function PositionPatchEventHandler(
  event: PositionPatchEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!state.subscription.instrument.get(event.instrument.id)) {
    throw new Error(`Trying to patch unsubscribed instrument: ${event.instrument.id}`);
  }

  const balance = state.balance.get(event.instrument.quote.id);
  const orderbook = state.orderbook.get(event.instrument.id);

  let position = balance.position[event.id];

  if (event.size == 0) {
    if (position) {
      position.averageExecutionRate = event.instrument.quote.fixed(event.rate);
      position.size = event.instrument.base.fixed(event.size);
      position.leverage = event.leverage;

      delete balance.position[event.id];

      if (orderbook) {
        const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

        position.calculateEstimatedUnrealizedPnL(rate);
      }

      changes.commit(position);
      changes.commit(balance);
    }
  }

  const size = (position.size = event.instrument.base.fixed(event.size));
  const averageExecutionRate = (position.averageExecutionRate =
    event.instrument.quote.fixed(event.rate));

  if (!position) {
    position = new Position(
      event.id,
      event.instrument,
      event.mode,
      averageExecutionRate,
      size,
      event.leverage
    );

    balance.position[event.id] = position;
  } else {
    position.averageExecutionRate = averageExecutionRate;
    position.size = size;
    position.leverage = event.leverage;
  }

  if (orderbook) {
    const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

    position.calculateEstimatedUnrealizedPnL(rate);
  }

  changes.commit(position);
  changes.commit(balance);
}
