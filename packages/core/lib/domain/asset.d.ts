import { decimal } from './../shared/decimals';
export declare const AssetSelectorSeparator = ":";
/**
 * Supposed to query specific @see Asset based on string notation.
 */
export declare class AssetSelector {
    readonly id: string;
    readonly name: string;
    readonly adapterName: string;
    constructor(name: string, adapterName: string);
    /**
     * Returns unified notation of the asset.
     */
    toString(): string;
}
/**
 * Creates @see AssetSelector based on unified string notation.
 */
export declare function assetOf(selector: string): AssetSelector;
/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
export declare class Asset extends AssetSelector {
    readonly scale: number;
    readonly tickSize: decimal;
    constructor(name: string, adapterName: string, scale: number);
    /**
     * Rounds down a number to the asset precision.
     */
    floor(number: decimal): decimal;
    /**
     * Rounds up a number to the asset precision.
     */
    ceil(number: decimal): decimal;
}
//# sourceMappingURL=asset.d.ts.map