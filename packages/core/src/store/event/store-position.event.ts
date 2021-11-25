import { event } from '../../shared/topic';
import { timestamp } from '../../shared';
import { Position, Instrument, PositionMode } from '../../domain';
import { State } from '../store.state';
import { StoreEvent } from './store.event';

@event
export class PositionLoadEvent implements StoreEvent {
  type = 'position-load';

  constructor(readonly position: Position, readonly timestamp: timestamp) {}
}

export function PositionLoadEventHandler(event: PositionLoadEvent, state: State) {
  if (
    event.position.instrument.toString()! in state.subscription.instrument ||
    event.position.size == 0
  ) {
    return;
  }

  event.position.timestamp = event.timestamp;

  const balance = state.balance[event.position.instrument.quote.toString()];
  const orderbook = state.orderbook[event.position.instrument.toString()];

  balance.position[event.position.toString()] = event.position;

  if (orderbook) {
    const rate = event.position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

    event.position.calculatePnL(rate);
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

export function PositionPatchEventHandler(event: PositionPatchEvent, state: State) {
  if (!(event.instrument.toString() in state.subscription.instrument)) {
    return;
  }

  const balance = state.balance[event.instrument.quote.toString()];
  const orderbook = state.orderbook[event.instrument.toString()];

  let position = balance.position[event.id];

  if (event.size == 0) {
    if (position) {
      position.averageExecutionRate = event.instrument.quote.fixed(event.rate);
      position.size = event.instrument.base.fixed(event.size);
      position.leverage = event.leverage;

      delete balance.position[event.id];

      if (orderbook) {
        const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

        position.calculatePnL(rate);
      }

      return [position, balance];
    }

    return;
  }

  if (!position) {
    position = new Position(event.id, event.instrument);

    balance.position[event.id] = position;
  }

  position.averageExecutionRate = event.instrument.quote.fixed(event.rate);
  position.size = event.instrument.base.fixed(event.size);
  position.leverage = event.leverage;
  position.mode = event.mode;

  if (orderbook) {
    const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

    position.calculatePnL(rate);
  }

  return [position, balance];
}
