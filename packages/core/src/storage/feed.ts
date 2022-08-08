import { Candle, InstrumentSelector } from '../domain';
import { d } from '../shared';
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
        json: JSON.stringify({
          o: it.open.toString(),
          h: it.high.toString(),
          l: it.low.toString(),
          c: it.close.toString(),
          v: it.volume?.toString()
        })
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

    return rows.map(it => {
      const payload = JSON.parse(it.json);

      return new Candle(
        it.timestamp,
        d(payload.o),
        d(payload.h),
        d(payload.l),
        d(payload.c),
        d(payload.v ?? 0)
      );
    });
  }
}
