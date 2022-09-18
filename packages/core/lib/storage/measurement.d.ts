import { timestamp } from '../shared';
import { Storage, StorageQueryOptions } from './storage';
export interface Measure {
    timestamp: timestamp;
    kind: string;
    payload: any;
}
/**
 *
 */
export declare class Measurement {
    private readonly storage;
    constructor(storage: Storage);
    /**
     *
     * @returns
     */
    index(): Promise<Array<number>>;
    /**
     *
     * @param session
     * @param measurements
     * @returns
     */
    save(session: number, measurements: Measure[]): Promise<void>;
    /**
     *
     * @param session
     * @param options
     * @returns
     */
    query(session: number, options: StorageQueryOptions): Promise<Measure[]>;
}
//# sourceMappingURL=measurement.d.ts.map