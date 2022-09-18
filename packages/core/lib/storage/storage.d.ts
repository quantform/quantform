export declare type StorageDocument = {
    timestamp: number;
    kind: string;
    json: string;
};
export declare type StorageQueryOptions = {
    from?: number;
    to?: number;
    kind?: string;
    count: number;
};
/**
 *
 */
export declare type StorageFactory = (type: string) => Storage;
/**
 *
 */
export interface Storage {
    /**
     *
     */
    index(): Promise<Array<string>>;
    /**
     *
     * @param library
     * @param documents
     */
    save(library: string, documents: StorageDocument[]): Promise<void>;
    /**
     *
     * @param library
     * @param options
     */
    query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]>;
}
export declare function inMemoryStorageFactory(): StorageFactory;
/**
 *
 */
export declare class InMemoryStorage implements Storage {
    private tables;
    /**
     *
     * @returns
     */
    index(): Promise<Array<string>>;
    /**
     *
     * @param library
     * @param options
     * @returns
     */
    query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]>;
    /**
     *
     * @param library
     * @param documents
     */
    save(library: string, documents: StorageDocument[]): Promise<void>;
    /**
     *
     */
    clear(): void;
}
//# sourceMappingURL=storage.d.ts.map