import { InstrumentSelector } from '@lib/component';
import { d } from '@lib/shared';
import { Storage, StorageDocument, StorageQueryOptions } from '@lib/storage';
import { OrderbookPatchEvent, TradePatchEvent } from '@lib/store';

export type StorageEvent = TradePatchEvent | OrderbookPatchEvent;

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
   * @param events
   * @returns
   */
  async save(events: StorageEvent[]): Promise<void> {
    const grouped = events.reduce((aggregate, it) => {
      const document = this.serializeEvent(it);

      if (!document) {
        return aggregate;
      }

      if (aggregate[it.instrument.id]) {
        aggregate[it.instrument.id].push(document);
      } else {
        aggregate[it.instrument.id] = [document];
      }

      return aggregate;
    }, {} as Record<string, StorageDocument[]>);

    for (const instrument in grouped) {
      await this.storage.save(instrument, grouped[instrument]);
    }
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
  ): Promise<StorageEvent[]> {
    const documents = await this.storage.query(instrument.id, options);

    return documents.map(it => this.deserializeEvent(it, instrument));
  }

  /**
   * Converts a StorageEvent to a persisted StorageDocument.
   */
  protected serializeEvent(event: StorageEvent): StorageDocument | undefined {
    if (event instanceof OrderbookPatchEvent) {
      return {
        timestamp: event.timestamp,
        kind: 'orderbook',
        json: JSON.stringify({
          ar: event.ask.rate.toString(),
          ab: event.ask.quantity.toString(),
          br: event.bid.rate.toString(),
          bb: event.bid.quantity.toString()
        })
      };
    }

    if (event instanceof TradePatchEvent) {
      return {
        timestamp: event.timestamp,
        kind: 'trade',
        json: JSON.stringify({
          r: event.rate.toString(),
          q: event.quantity.toString()
        })
      };
    }

    return undefined;
  }

  /**
   * Converts a persisted StorageDocument to a StorageEvent.
   */
  protected deserializeEvent(
    document: StorageDocument,
    instrument: InstrumentSelector
  ): StorageEvent {
    const payload = JSON.parse(document.json);

    if (document.kind === 'trade') {
      return new TradePatchEvent(
        instrument,
        d(payload.r),
        d(payload.q),
        document.timestamp
      );
    }

    if (document.kind === 'orderbook') {
      return new OrderbookPatchEvent(
        instrument,
        { rate: d(payload.ar), quantity: d(payload.aq), next: undefined },
        { rate: d(payload.bb), quantity: d(payload.bq), next: undefined },
        document.timestamp
      );
    }

    throw new Error(`Unsupported event: ${document.kind}`);
  }
}
