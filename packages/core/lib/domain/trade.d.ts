import { decimal } from '../shared';
import { Instrument } from '.';
import { Component } from './component';
/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
export declare class Trade implements Component {
    timestamp: number;
    readonly instrument: Instrument;
    rate: decimal;
    quantity: decimal;
    readonly id: string;
    readonly kind = "trade";
    constructor(timestamp: number, instrument: Instrument, rate: decimal, quantity: decimal);
    toString(): string;
}
//# sourceMappingURL=trade.d.ts.map