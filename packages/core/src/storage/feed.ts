import { StoreEvent } from '../store/event';
import { Instrument } from '../domain';
import { timestamp } from '../common';

export interface Feed {
  read(instrument: Instrument, from: timestamp, to: timestamp): Promise<StoreEvent[]>;

  write(instrument: Instrument, events: StoreEvent[]): Promise<void>;
}
