import { InstrumentSelector, Liquidity, Orderbook } from '../domain';
import { decimal, timestamp } from '../shared';
import { StoreEvent } from './store.event';
import { State, StateChangeTracker } from './store-state';

export class OrderbookSnapshotEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly ask: { rate: decimal; quantity: decimal } | undefined,
    readonly bid: { rate: decimal; quantity: decimal } | undefined,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    if (!state.subscription.instrument.get(this.instrument.id)) {
      throw new Error(`Trying to patch unsubscribed instrument: ${this.instrument.id}`);
    }

    const orderbook = state.orderbook.tryGetOrSet(
      this.instrument.id,
      () => new Orderbook(state.universe.instrument.get(this.instrument.id))
    );

    state.timestamp = this.timestamp;
    orderbook.timestamp = this.timestamp;

    if (this.ask) {
      orderbook.asks = new Liquidity(
        orderbook.instrument.quote.floor(this.ask.rate),
        orderbook.instrument.base.floor(this.ask.quantity)
      );
    } else {
      orderbook.asks = undefined;
    }

    if (this.bid) {
      orderbook.bids = new Liquidity(
        orderbook.instrument.quote.floor(this.bid.rate),
        orderbook.instrument.base.floor(this.bid.quantity)
      );
    } else {
      orderbook.bids = undefined;
    }

    const quote = state.balance.get(orderbook.instrument.quote.id);

    if (quote) {
      for (const position of Object.values(quote.position)) {
        if (position.instrument.id != orderbook.instrument.id) {
          continue;
        }

        const rate = position.size.greaterThanOrEqualTo(0)
          ? orderbook.bids.rate
          : orderbook.asks.rate;

        if (rate) {
          position.calculateEstimatedUnrealizedPnL(rate);
        }
      }

      if (quote.total.lessThan(0)) {
        throw new Error('You have been liquidated.');
      }
    }

    changes.commit(orderbook);
  }
}

function addLiquidity(
  head: Liquidity | undefined,
  rate: decimal,
  quantity: decimal,
  comparer: (lhs: decimal, rhs: decimal) => number
) {
  if (!head) {
    return new Liquidity(rate, quantity);
  }

  if (comparer(head.rate, rate) > 0) {
    return new Liquidity(rate, quantity, head);
  } else if (comparer(head.rate, rate) == 0) {
    head.quantity = quantity;
  } else {
    head.visit(it => {
      if (it.next) {
        if (comparer(it.next.rate, rate) == 0) {
          it.next.quantity = quantity;

          return false;
        }

        if (comparer(it.next.rate, rate) > 0) {
          it.next = new Liquidity(rate, quantity, it.next);

          return false;
        }

        return true;
      } else {
        it.next = new Liquidity(rate, quantity);

        return false;
      }
    });
  }

  return head;
}

function removeLiquidity(
  head: Liquidity | undefined,
  rate: decimal,
  comparer: (lhs: decimal, rhs: decimal) => number
) {
  if (!head) {
    return head;
  }

  if (comparer(head.rate, rate) == 0) {
    return head.next;
  }

  head.visit(it => {
    if (it.next && comparer(it.next.rate, rate) == 0) {
      it.next = it.next.next;

      return false;
    }
  });

  return head;
}

const askComparer = (lhs: decimal, rhs: decimal) => lhs.comparedTo(rhs);
const bidComparer = (lhs: decimal, rhs: decimal) => rhs.comparedTo(lhs);

export class OrderbookPatchAsksEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: decimal,
    readonly quantity: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const orderbook = state.orderbook.tryGetOrSet(
      this.instrument.id,
      () => new Orderbook(state.universe.instrument.get(this.instrument.id))
    );

    orderbook.timestamp = this.timestamp;
    state.timestamp = this.timestamp;

    orderbook.asks = this.quantity.greaterThan(0)
      ? addLiquidity(orderbook.asks, this.rate, this.quantity, askComparer)
      : removeLiquidity(orderbook.asks, this.rate, askComparer);

    changes.commit(orderbook);
  }
}

export class OrderbookPatchBidsEvent implements StoreEvent {
  constructor(
    readonly instrument: InstrumentSelector,
    readonly rate: decimal,
    readonly quantity: decimal,
    readonly timestamp: timestamp
  ) {}

  handle(state: State, changes: StateChangeTracker): void {
    const orderbook = state.orderbook.tryGetOrSet(
      this.instrument.id,
      () => new Orderbook(state.universe.instrument.get(this.instrument.id))
    );

    orderbook.timestamp = this.timestamp;
    state.timestamp = this.timestamp;

    orderbook.bids = this.quantity.greaterThan(0)
      ? addLiquidity(orderbook.bids, this.rate, this.quantity, bidComparer)
      : removeLiquidity(orderbook.bids, this.rate, bidComparer);

    changes.commit(orderbook);
  }
}
