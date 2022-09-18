import { decimal, timestamp } from '../shared';
export declare class Candle {
    timestamp: timestamp;
    open: decimal;
    high: decimal;
    low: decimal;
    close: decimal;
    volume?: decimal | undefined;
    constructor(timestamp: timestamp, open: decimal, high: decimal, low: decimal, close: decimal, volume?: decimal | undefined);
    apply(value: decimal): void;
}
//# sourceMappingURL=candle.d.ts.map