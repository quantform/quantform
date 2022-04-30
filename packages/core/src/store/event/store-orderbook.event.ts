import { InstrumentSelector } from '../../domain/instrument';
import { Orderbook } from '../../domain/orderbook';
import { timestamp } from '../../shared';
import { event } from '../../shared/topic';
import { State, StateChangeTracker } from '../store-state';
import { StoreEvent } from './store.event';

@event
export class OrderbookPatchEvent implements StoreEvent {
  type = 'orderbook-patch';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly bestAskRate: number,
    readonly bestAskQuantity: number,
    readonly bestBidRate: number,
    readonly bestBidQuantity: number,
    readonly timestamp: timestamp
  ) {}
}

export function OrderbookPatchEventHandler(
  event: OrderbookPatchEvent,
  state: State,
  changes: StateChangeTracker
) {
  if (!state.subscription.instrument.get(event.instrument.id)) {
    throw new Error(`Trying to patch unsubscribed instrument: ${event.instrument.id}`);
  }

  const orderbook = state.orderbook.tryGetOrSet(
    event.instrument.id,
    () => new Orderbook(state.universe.instrument.get(event.instrument.id))
  );

  state.timestamp = event.timestamp;

  orderbook.timestamp = event.timestamp;
  orderbook.bestAskRate = orderbook.instrument.quote.fixed(event.bestAskRate);
  orderbook.bestAskQuantity = orderbook.instrument.base.fixed(event.bestAskQuantity);
  orderbook.bestBidRate = orderbook.instrument.quote.fixed(event.bestBidRate);
  orderbook.bestBidQuantity = orderbook.instrument.base.fixed(event.bestBidQuantity);

  const quote = state.balance.get(orderbook.instrument.quote.id);

  if (quote) {
    for (const position of Object.values(quote.position)) {
      if (position.instrument.id != orderbook.instrument.id) {
        continue;
      }

      const rate = position.size >= 0 ? orderbook.bestBidRate : orderbook.bestAskRate;

      position.calculateEstimatedUnrealizedPnL(rate);
    }

    if (quote.total < 0) {
      throw new Error('liquidated');
    }
  }

  changes.commit(orderbook);
}
