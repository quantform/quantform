import { Candle, InstrumentSelector } from '../domain';
import { StoreEvent } from '../store';
import { Storage, StorageQueryOptions } from './storage';

/**
 * Represents a storage supposed to store historical data.
 * You can use CLI to fetch and save data in the Feed.
 */
export class Feed {
  constructor(private readonly storage: Storage) {}

  /**
   * Returns all instrument names stored in the feed.
   */
  index(): Promise<Array<string>> {
    return this.storage.index();
  }

  /**
   *
   * @param instrument
   * @param candles
   * @returns
   */
  save(instrument: InstrumentSelector, candles: Candle[]): Promise<void> {
    return this.storage.save(
      instrument.toString(),
      candles.map(it => ({
        timestamp: it.timestamp,
        kind: 'candle',
        json: JSON.stringify(it, (key, value) =>
          key != 'timestamp' && key != 'type' && key != 'instrument' ? value : undefined
        )
      }))
    );
  }

  /**
   *
   * @param instrument
   * @param options
   * @returns
   */
  async query(
    instrument: InstrumentSelector,
    options: StorageQueryOptions
  ): Promise<Candle[]> {
    const rows = await this.storage.query(instrument.id, options);

    return rows.map(it => ({
      timestamp: it.timestamp,
      type: it.kind,
      instrument,
      ...JSON.parse(it.json)
    }));
  }
}
