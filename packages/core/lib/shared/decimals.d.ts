import { Decimal } from 'decimal.js';
declare module 'decimal.js' {
    interface Decimal {
        toFloor(decimalPlaces: number): Decimal;
        toCeil(decimalPlaces: number): Decimal;
    }
}
export declare class decimal extends Decimal {
}
export declare function d(value: Decimal.Value): decimal;
export declare namespace d {
    var Zero: decimal;
}
export declare function weightedMean(values: decimal[], weights: decimal[]): decimal;
export declare function pnl(entryRate: decimal, exitRate: decimal, amount: decimal): Decimal;
/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
export declare function candledown(timestamp: number, timeframe: number): number;
/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
export declare function candleup(timestamp: number, timeframe: number): number;
//# sourceMappingURL=decimals.d.ts.map