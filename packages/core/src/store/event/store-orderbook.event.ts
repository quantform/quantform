import { event } from '../../common/topic';
import { timestamp } from '../../common';
import { InstrumentSelector } from '../../domain/instrument';
import { Orderbook } from '../../domain/orderbook';
import { State } from '../store.state';
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

export function OrderbookPatchEventHandler(event: OrderbookPatchEvent, state: State) {
  const instrumentKey = event.instrument.toString();

  if (!(instrumentKey in state.subscription.instrument)) {
    throw new Error(`Trying to patch unsubscribed instrument: ${instrumentKey}`);
  }

  let orderbook = state.orderbook[instrumentKey];

  if (!orderbook) {
    const instrument = state.universe.instrument[instrumentKey];

    orderbook = new Orderbook(instrument);

    state.orderbook[instrumentKey] = orderbook;
  }

  state.timestamp = event.timestamp;

  orderbook.timestamp = event.timestamp;
  orderbook.bestAskRate = orderbook.instrument.quote.fixed(event.bestAskRate);
  orderbook.bestAskQuantity = orderbook.instrument.base.fixed(event.bestAskQuantity);
  orderbook.bestBidRate = orderbook.instrument.quote.fixed(event.bestBidRate);
  orderbook.bestBidQuantity = orderbook.instrument.base.fixed(event.bestBidQuantity);

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
