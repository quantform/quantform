import { timestamp } from '../../common/datetime';
import { Component, InstrumentSelector } from '../../domain';
import { ExchangeStoreEvent } from './store.event';

export class CandleEvent implements ExchangeStoreEvent {
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

  applicable(): boolean {
    return true;
  }

  execute(): Component | Component[] {
    throw new Error(
      'You should not patch a store with this event. Use FeedInterceptor to intercept this event.'
    );
  }
}
