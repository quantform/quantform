/// <reference types="node" />
import { EventEmitter } from 'stream';
export declare type Work = () => Promise<void>;
export declare class Worker extends EventEmitter {
    private readonly queue;
    private promise?;
    enqueue(job: Work): void;
    wait(): Promise<void>;
    private tryNext;
}
//# sourceMappingURL=worker.d.ts.map