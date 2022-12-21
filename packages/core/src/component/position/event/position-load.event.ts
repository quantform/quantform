import { Instrument, Position, PositionMode } from '@lib/component';
import { decimal, timestamp } from '@lib/shared';
import {
  BalanceNotFoundError,
  InstrumentNotSubscribedError,
  State,
  StateChangeTracker,
  StoreEvent
} from '@lib/store';

export class PositionLoadEvent implements StoreEvent {
  constructor(readonly position: Position, readonly timestamp: timestamp) {}

  handle(state: State): void {
    if (!state.subscription.instrument.get(this.position.instrument.id)) {
      throw new InstrumentNotSubscribedError(this.position.instrument);
    }

    this.position.timestamp = this.timestamp;

    const balance = state.balance.get(this.position.instrument.quote.id);
    if (!balance) {
      throw new BalanceNotFoundError(this.position.instrument.quote);
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
