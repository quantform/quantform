import { TradePatchEventHandler } from './store-trade.event';
import { timestamp } from '../../common/datetime';
import { InstrumentSelector } from '../../domain';
import { State } from '../store.state';
import { StoreEvent } from './store.event';
import { event } from '../../common/topic';
import { OrderbookPatchEventHandler } from 'src';

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

export function CandleEventHandler(event: CandleEvent, state: State) {
  const instrument = state.universe.instrument[event.instrument.toString()];

  return [
    // patch trade object
    TradePatchEventHandler(
      {
        type: 'trade-patch',
        instrument: event.instrument,
        quantity: event.volume,
        rate: event.close,
        timestamp: event.timestamp
      },
      state
    ),
    // patch orderbook by assuming candle close price is mid orderbook price
    OrderbookPatchEventHandler(
      {
        type: 'orderbook-patch',
        instrument: event.instrument,
        bestAskQuantity: event.volume * 0.5,
        bestAskRate: event.close + instrument.quote.tickSize,
        bestBidQuantity: event.volume * 0.5,
        bestBidRate: event.close - instrument.quote.tickSize,
        timestamp: event.timestamp
      },
      state
    )
  ];
}
