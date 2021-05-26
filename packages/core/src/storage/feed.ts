import { ExchangeStoreEvent } from '../store/event';
import { Instrument } from '../domain';
import { timestamp } from '../common';

export interface Feed {
  read(
    instrument: Instrument,
    from: timestamp,
    to: timestamp
  ): Promise<ExchangeStoreEvent[]>;

  write(instrument: Instrument, events: ExchangeStoreEvent[]): Promise<void>;
}
