import { TradePatchEventHandler } from './store-trade.event';
import { timestamp } from '../../common/datetime';
import { InstrumentSelector } from '../../domain';
import { State } from '../store.state';
import { StoreEvent } from './store.event';
import { event } from '../../common/topic';

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
  return TradePatchEventHandler(
    {
      type: 'trade-patch',
      instrument: event.instrument,
      quantity: event.volume,
      rate: event.close,
      timestamp: event.timestamp
    },
    state
  );
}
