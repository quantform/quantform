import { StoreEvent } from '../store/event';
import { InstrumentSelector } from '../domain';
import { Storage, StorageQueryOptions } from './storage';

export class Feed {
  constructor(private readonly storage: Storage) {}

  index(): Promise<Array<string>> {
    return this.storage.index();
  }

  save(instrument: InstrumentSelector, events: StoreEvent[]): Promise<void> {
    return this.storage.save(
      instrument.toString(),
      events.map(it => ({
        timestamp: it.timestamp,
        kind: it.type,
        json: JSON.stringify(it, (key, value) =>
          key != 'timestamp' && key != 'type' && key != 'instrument' ? value : undefined
        )
      }))
    );
  }

  async query(
    instrument: InstrumentSelector,
    options: StorageQueryOptions
  ): Promise<StoreEvent[]> {
    const rows = await this.storage.query(instrument.toString(), options);

    return rows.map(it => ({
      timestamp: it.timestamp,
      type: it.kind,
      instrument,
      ...JSON.parse(it.json)
    }));
  }
}
