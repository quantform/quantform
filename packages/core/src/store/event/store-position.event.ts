import { timestamp } from '../../common';
import { Component, Position, Instrument, PositionMode } from '../../domain';
import { State } from '../store.state';
import { ExchangeStoreEvent } from './store.event';

export class PositionLoadEvent implements ExchangeStoreEvent {
  type = 'position-load';

  constructor(readonly position: Position, readonly timestamp: timestamp) {}

  applicable(state: State): boolean {
    return this.position.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    if (this.position.size == 0) {
      return;
    }

    this.position.timestamp = this.timestamp;

    const balance = state.balance[this.position.instrument.quote.toString()];
    const orderbook = state.orderbook[this.position.instrument.toString()];

    balance.position[this.position.toString()] = this.position;

    if (orderbook) {
      const rate =
        this.position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

      this.position.calculatePnL(rate);
    }

    return this.position;
  }
}

export class PositionPatchEvent implements ExchangeStoreEvent {
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

  applicable(state: State): boolean {
    return this.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    const balance = state.balance[this.instrument.quote.toString()];
    const orderbook = state.orderbook[this.instrument.toString()];

    let position = balance.position[this.id];

    if (this.size == 0) {
      if (position) {
        position.averageExecutionRate = this.instrument.quote.fixed(this.rate);
        position.size = this.instrument.base.fixed(this.size);
        position.leverage = this.leverage;

        delete balance.position[this.id];

        if (orderbook) {
          const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

          position.calculatePnL(rate);
        }

        return [position, balance];
      }

      return;
    }

    if (!position) {
      position = new Position(this.id, this.instrument);

      balance.position[this.id] = position;
    }

    position.averageExecutionRate = this.instrument.quote.fixed(this.rate);
    position.size = this.instrument.base.fixed(this.size);
    position.leverage = this.leverage;
    position.mode = this.mode;

    if (orderbook) {
      const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

      position.calculatePnL(rate);
    }

    return [position, balance];
  }
}
