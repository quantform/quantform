import { timestamp } from '../../common';
import { Component } from '../../domain';
import { InstrumentSelector } from '../../domain/instrument';
import { Orderbook } from '../../domain/orderbook';
import { State } from '../store.state';
import { ExchangeStoreEvent } from './store.event';

export class OrderbookPatchEvent implements ExchangeStoreEvent {
  type = 'orderbook-patch';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly bestAskRate: number,
    readonly bestAskQuantity: number,
    readonly bestBidRate: number,
    readonly bestBidQuantity: number,
    readonly timestamp: timestamp
  ) {}

  applicable(state: State): boolean {
    return this.instrument.toString() in state.subscription.instrument;
  }

  execute(state: State): Component | Component[] {
    let orderbook = state.orderbook[this.instrument.toString()];

    if (!orderbook) {
      const instrument = state.universe.instrument[this.instrument.toString()];

      orderbook = new Orderbook(instrument);

      state.orderbook[this.instrument.toString()] = orderbook;
    }

    orderbook.bestAskRate = orderbook.instrument.quote.fixed(this.bestAskRate);
    orderbook.bestAskQuantity = orderbook.instrument.base.fixed(this.bestAskQuantity);
    orderbook.bestBidRate = orderbook.instrument.quote.fixed(this.bestBidRate);
    orderbook.bestBidQuantity = orderbook.instrument.base.fixed(this.bestBidQuantity);

    const quote = state.balance[orderbook.instrument.quote.toString()];

    if (quote) {
      for (const position of Object.values(quote.position)) {
        if (position.instrument.toString() != orderbook.toString()) {
          continue;
        }

        const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

        position.calculatePnL(rate);
      }

      if (quote.total < 0) {
        throw new Error('liquidated');
      }
    }

    return orderbook;
  }
}
