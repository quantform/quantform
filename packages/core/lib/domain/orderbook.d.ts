import { Instrument } from '../domain';
import { decimal } from '../shared';
import { Component } from './component';
export interface Liquidity {
    rate: decimal;
    quantity: decimal;
    next: this | undefined;
}
export declare const LiquidityAskComparer: (lhs: {
    rate: decimal;
}, rhs: {
    rate: decimal;
}) => number;
export declare const LiquidityBidComparer: (lhs: {
    rate: decimal;
}, rhs: {
    rate: decimal;
}) => number;
/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
export declare class Orderbook implements Component {
    timestamp: number;
    readonly instrument: Instrument;
    asks: Liquidity;
    bids: Liquidity;
    readonly id: string;
    readonly kind = "orderbook";
    constructor(timestamp: number, instrument: Instrument, asks: Liquidity, bids: Liquidity);
    toString(): string;
}
//# sourceMappingURL=orderbook.d.ts.map