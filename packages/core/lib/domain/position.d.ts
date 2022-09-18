import { Instrument } from '../domain';
import { decimal } from '../shared';
import { Component } from './component';
export declare type PositionMode = 'CROSS' | 'ISOLATED';
export declare class Position implements Component {
    timestamp: number;
    readonly id: string;
    readonly instrument: Instrument;
    readonly mode: PositionMode;
    averageExecutionRate: decimal;
    size: decimal;
    leverage: number;
    readonly kind = "position";
    estimatedUnrealizedPnL?: decimal;
    get margin(): decimal;
    constructor(timestamp: number, id: string, instrument: Instrument, mode: PositionMode, averageExecutionRate: decimal, size: decimal, leverage: number);
    calculateEstimatedUnrealizedPnL(rate: decimal): decimal;
    toString(): string;
}
//# sourceMappingURL=position.d.ts.map