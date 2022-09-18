import { decimal } from '../shared';
export declare class Commission {
    readonly makerRate: decimal;
    readonly takerRate: decimal;
    static readonly Zero: Commission;
    constructor(makerRate: decimal, takerRate: decimal);
    calculateMakerFee(value: decimal): import("decimal.js").default;
    calculateTakerFee(value: decimal): import("decimal.js").default;
    applyMakerFee(value: decimal): decimal;
    applyTakerFee(value: decimal): decimal;
}
export declare function commissionPercentOf(fees: {
    maker: decimal;
    taker: decimal;
}): Commission;
//# sourceMappingURL=commission.d.ts.map