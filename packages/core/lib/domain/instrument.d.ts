import { Asset, AssetSelector } from './asset';
import { Commission } from './commission';
import { Component } from './component';
export declare const InstrumentSelectorSeparator = "-";
export declare class InstrumentSelector {
    readonly id: string;
    readonly base: AssetSelector;
    readonly quote: AssetSelector;
    constructor(base: string, quote: string, adapter: string);
    toString(): string;
}
/**
 * Represents trading market which is made up by two trading assets (base and quoted).
 */
export declare class Instrument extends InstrumentSelector implements Component {
    timestamp: number;
    readonly base: Asset;
    readonly quote: Asset;
    readonly raw: string;
    commission: Commission;
    readonly kind = "instrument";
    readonly cross: Instrument | undefined;
    leverage: number | undefined;
    constructor(timestamp: number, base: Asset, quote: Asset, raw: string, commission: Commission);
}
export declare function instrumentOf(selector: string): InstrumentSelector;
//# sourceMappingURL=instrument.d.ts.map