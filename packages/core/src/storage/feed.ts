import { StoreEvent } from '../store/event';
import { InstrumentSelector } from '../domain';
import { timestamp } from '../common';

export interface Feed {
  read(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp
  ): Promise<StoreEvent[]>;

  write(instrument: InstrumentSelector, events: StoreEvent[]): Promise<void>;
}
