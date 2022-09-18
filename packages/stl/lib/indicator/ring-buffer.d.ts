export declare class RingBuffer<T> {
    readonly capacity: number;
    private items;
    private first;
    private last;
    private length;
    get size(): number;
    get isEmpty(): boolean;
    get isFull(): boolean;
    constructor(capacity: number);
    peek(): T;
    dequeue(): T;
    enqueue(element: T): T | null;
    forEach(fn: (value: T, index: number) => void): void;
    at(index: number): T;
}
//# sourceMappingURL=ring-buffer.d.ts.map