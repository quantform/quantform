import { Instrument, Position, PositionMode } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

export class PositionLoadEvent implements StoreEvent {
  constructor(readonly position: Position, readonly timestamp: timestamp) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.position.instrument.id)) {
      throw new Error(
        `Trying to patch unsubscribed instrument: ${this.position.instrument.id}`
      );
    }

    this.position.timestamp = this.timestamp;

    const balance = state.balance.get(this.position.instrument.quote.id);
    const orderbook = state.orderbook.get(this.position.instrument.id);

    balance.position[this.position.id] = this.position;

    if (orderbook) {
      const rate = this.position.size.greaterThanOrEqualTo(0)
        ? orderbook.bestBidRate
        : orderbook.bestAskRate;

      this.position.calculateEstimatedUnrealizedPnL(rate);
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

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw new Error(`Trying to patch unsubscribed instrument: ${this.instrument.id}`);
    }

    const balance = state.balance.get(this.instrument.quote.id);
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
            ? orderbook.bestBidRate
            : orderbook.bestAskRate;

          position.calculateEstimatedUnrealizedPnL(rate);
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
        ? orderbook.bestBidRate
        : orderbook.bestAskRate;

      position.calculateEstimatedUnrealizedPnL(rate);
    }

    changes.commit(position);
    changes.commit(balance);
  }
}
