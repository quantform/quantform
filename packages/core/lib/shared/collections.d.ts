export declare class Set<T extends {
    id: string;
}> {
    private readonly array;
    constructor(values?: ReadonlyArray<T>);
    get(id: string): T | undefined;
    tryGetOrSet(id: string, setter: () => T): T;
    upsert(value: T): T;
    remove(value: T): void;
    asReadonlyArray(): ReadonlyArray<T>;
    clear(): void;
}
export declare class PriorityList<T extends {
    next: T | undefined;
}> {
    private readonly comparer;
    private readonly getKeyFn;
    private valueByKey;
    head: T | undefined;
    constructor(comparer: (lhs: Omit<T, 'next'>, rhs: Omit<T, 'next'>) => number, getKeyFn: (key: Omit<T, 'next'>) => string);
    getByKey(key: string): T;
    private make;
    enqueue(value: Omit<T, 'next'>): void;
    dequeue(value: Omit<T, 'next'>): void;
    clear(): void;
    visit(fn: (value: T) => boolean): void;
    reduce<K>(fn: (value: T, aggregate: K) => K, initValue: K): K;
}
//# sourceMappingURL=collections.d.ts.map