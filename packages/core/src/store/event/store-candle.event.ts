import { timestamp } from '../../common/datetime';
import { InstrumentSelector } from '../../domain';
import { StoreEvent } from './store.event';

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
