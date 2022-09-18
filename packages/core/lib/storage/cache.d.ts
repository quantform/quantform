import { Storage } from './storage';
export declare class Cache {
    private readonly storage;
    constructor(storage: Storage);
    tryGet<T>(getter: () => Promise<T>, options: {
        key: string;
        ttl?: number;
    }): Promise<T>;
}
//# sourceMappingURL=cache.d.ts.map