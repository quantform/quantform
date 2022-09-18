import { decimal } from '../shared';
import { Balance } from './balance';
import { Component } from './component';
import { Instrument } from './instrument';
export declare type OrderState = 'NEW' | 'PENDING' | 'FILLED' | 'CANCELING' | 'CANCELED' | 'REJECTED';
export declare class Order implements Component {
    timestamp: number;
    readonly id: string;
    readonly instrument: Instrument;
    readonly quantity: decimal;
    createdAt: number;
    readonly rate?: decimal | undefined;
    readonly stopRate?: decimal | undefined;
    readonly kind = "order";
    state: OrderState;
    quantityExecuted: decimal;
    averageExecutionRate?: decimal;
    externalId?: string;
    constructor(timestamp: number, id: string, instrument: Instrument, quantity: decimal, createdAt: number, rate?: decimal | undefined, stopRate?: decimal | undefined);
    toString(): string;
    calculateBalanceToLock(base: Balance, quote: Balance): {
        base?: decimal;
        quote?: decimal;
    };
}
//# sourceMappingURL=order.d.ts.map