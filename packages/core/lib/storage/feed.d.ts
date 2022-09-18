import { InstrumentSelector } from '../domain';
import { OrderbookPatchEvent, TradePatchEvent } from '../store';
import { Storage, StorageDocument, StorageQueryOptions } from './storage';
export declare type StorageEvent = TradePatchEvent | OrderbookPatchEvent;
/**
 * Represents a storage supposed to store historical data.
 * You can use CLI to fetch and save data in the Feed.
 */
export declare class Feed {
    private readonly storage;
    constructor(storage: Storage);
    /**
     * Returns all instrument names stored in the feed.
     */
    index(): Promise<Array<string>>;
    /**
     *
     * @param events
     * @returns
     */
    save(events: StorageEvent[]): Promise<void>;
    /**
     *
     * @param instrument
     * @param options
     * @returns
     */
    query(instrument: InstrumentSelector, options: StorageQueryOptions): Promise<StorageEvent[]>;
    /**
     * Converts a StorageEvent to a persisted StorageDocument.
     */
    protected serializeEvent(event: StorageEvent): StorageDocument | undefined;
    /**
     * Converts a persisted StorageDocument to a StorageEvent.
     */
    protected deserializeEvent(document: StorageDocument, instrument: InstrumentSelector): StorageEvent;
}
//# sourceMappingURL=feed.d.ts.map