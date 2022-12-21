import { Instrument, Position, PositionMode } from '@lib/component';
import { decimal, timestamp } from '@lib/shared';
import {
  BalanceNotFoundError,
  InstrumentNotSubscribedError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

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
      throw new InstrumentNotSubscribedError(this.instrument);
    }

    const balance = state.balance.get(this.instrument.quote.id);
    if (!balance) {
      throw new BalanceNotFoundError(this.instrument.quote);
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
