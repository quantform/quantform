import { Storage, StorageDocument, StorageFactory, StorageQueryOptions } from '@quantform/core';
import { Database } from 'better-sqlite3';
export declare function sqlite(directory?: string): StorageFactory;
export declare class SQLiteStorage implements Storage {
    private readonly filename;
    protected connection?: Database;
    constructor(filename: string);
    private tryConnect;
    private tryCreateTable;
    index(): Promise<Array<string>>;
    query(library: string, options: StorageQueryOptions): Promise<StorageDocument[]>;
    save(library: string, documents: StorageDocument[]): Promise<void>;
}
//# sourceMappingURL=sqlite-storage.d.ts.map