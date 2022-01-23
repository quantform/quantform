import { StateChangeTracker } from '..';
import { InstrumentSelector } from '../../domain';
import { timestamp } from '../../shared/datetime';
import { event } from '../../shared/topic';
import { State } from '../store.state';
import { OrderbookPatchEventHandler } from './store-orderbook.event';
import { TradePatchEventHandler } from './store-trade.event';
import { StoreEvent } from './store.event';

@event
export class CandleEvent implements StoreEvent {
  type = 'candle';

  constructor(
    readonly instrument: InstrumentSelector,
    readonly timeframe: number,
    readonly open: number,
    readonly high: number,
    readonly low: number,
    readonly close: number,
    readonly volume: number,
    readonly timestamp: timestamp
  ) {}
}

export function CandleEventHandler(
  event: CandleEvent,
  state: State,
  changes: StateChangeTracker
) {
  const instrument = state.universe.instrument[event.instrument.toString()];

  const patch = (timestamp: number, rate: number) => {
    // patch trade object
    TradePatchEventHandler(
      {
        type: 'trade-patch',
        instrument: event.instrument,
        quantity: event.volume,
        rate,
        timestamp
      },
      state,
      changes
    );

    // patch orderbook by assuming candle close price is mid orderbook price
    OrderbookPatchEventHandler(
      {
        type: 'orderbook-patch',
        instrument: event.instrument,
        bestAskQuantity: instrument.base.fixed(event.volume * 0.5),
        bestAskRate: rate,
        bestBidQuantity: instrument.base.fixed(event.volume * 0.5),
        bestBidRate: rate,
        timestamp
      },
      state,
      changes
    );

    state.timestamp = event.timestamp;

    changes.commitPendingChanges();
  };

  patch(event.timestamp, instrument.quote.fixed(event.open));
  patch(event.timestamp, instrument.quote.fixed(event.high));
  patch(event.timestamp, instrument.quote.fixed(event.low));
  patch(event.timestamp, instrument.quote.fixed(event.close));
}
