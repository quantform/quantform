import { Instrument, Position, PositionMode } from '../domain';
import { decimal, timestamp } from '../shared';
import { balanceNotFoundError, instrumentNotSubscribedError } from './error';
import { StoreEvent } from './store-event';
import { State, StateChangeTracker } from './store-state';

export class PositionLoadEvent implements StoreEvent {
  constructor(readonly position: Position, readonly timestamp: timestamp) {}

  handle(state: State): void {
    if (!state.subscription.instrument.get(this.position.instrument.id)) {
      throw instrumentNotSubscribedError(this.position.instrument);
    }

    this.position.timestamp = this.timestamp;

    const balance = state.balance.get(this.position.instrument.quote.id);
    if (!balance) {
      throw balanceNotFoundError(this.position.instrument.quote);
    }

    balance.position[this.position.id] = this.position;

    const orderbook = state.orderbook.get(this.position.instrument.id);
    if (orderbook) {
      const rate = this.position.size.greaterThanOrEqualTo(0)
        ? orderbook.bids.rate
        : orderbook.asks.rate;

      if (rate) {
        this.position.calculateEstimatedUnrealizedPnL(rate);
      }
    }
  }
}

export class PositionPatchEvent implements StoreEvent {
  constructor(
    readonly id: string,
    readonly instrument: Instrument,
    readonly rate: decimal,
    readonly size: decimal,
    readonly leverage: number,
    readonly mode: PositionMode,
    readonly timestamp: timestamp
  ) {}

  // eslint-disable-next-line complexity
  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw instrumentNotSubscribedError(this.instrument);
    }

    const balance = state.balance.get(this.instrument.quote.id);
    if (!balance) {
      throw balanceNotFoundError(this.instrument.quote);
    }

    const orderbook = state.orderbook.get(this.instrument.id);

    let position = balance.position[this.id];

    if (this.size.equals(0)) {
      if (position) {
        position.averageExecutionRate = this.instrument.quote.floor(this.rate);
        position.size = this.instrument.base.floor(this.size);
        position.leverage = this.leverage;

        delete balance.position[this.id];

        if (orderbook) {
          const rate = position.size.greaterThanOrEqualTo(0)
            ? orderbook.bids.rate
            : orderbook.asks.rate;

          if (rate) {
            position.calculateEstimatedUnrealizedPnL(rate);
          }
        }

        changes.commit(position);
        changes.commit(balance);
      }
    }

    const size = (position.size = this.instrument.base.floor(this.size));
    const averageExecutionRate = (position.averageExecutionRate =
      this.instrument.quote.floor(this.rate));

    if (!position) {
      position = new Position(
        this.timestamp,
        this.id,
        this.instrument,
        this.mode,
        averageExecutionRate,
        size,
        this.leverage
      );

      balance.position[this.id] = position;
    } else {
      position.averageExecutionRate = averageExecutionRate;
      position.size = size;
      position.leverage = this.leverage;
    }

    if (orderbook) {
      const rate = position.size.greaterThanOrEqualTo(0)
        ? orderbook.bids.rate
        : orderbook.asks.rate;

      if (rate) {
        position.calculateEstimatedUnrealizedPnL(rate);
      }
    }

    changes.commit(position);
    changes.commit(balance);
  }
}
