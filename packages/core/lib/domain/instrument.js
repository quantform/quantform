"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentOf = exports.Instrument = exports.InstrumentSelector = exports.InstrumentSelectorSeparator = void 0;
const asset_1 = require("./asset");
const error_1 = require("./error");
exports.InstrumentSelectorSeparator = '-';
class InstrumentSelector {
    constructor(base, quote, adapter) {
        this.base = new asset_1.AssetSelector(base.toLowerCase(), adapter.toLowerCase());
        this.quote = new asset_1.AssetSelector(quote.toLowerCase(), adapter.toLowerCase());
        this.id = `${this.base.id}${exports.InstrumentSelectorSeparator}${this.quote.name}`;
    }
    toString() {
        return this.id;
    }
}
exports.InstrumentSelector = InstrumentSelector;
/**
 * Represents trading market which is made up by two trading assets (base and quoted).
 */
class Instrument extends InstrumentSelector {
    constructor(timestamp, base, quote, raw, commission) {
        super(base.name, quote.name, base.adapterName);
        this.timestamp = timestamp;
        this.base = base;
        this.quote = quote;
        this.raw = raw;
        this.commission = commission;
        this.kind = 'instrument';
        this.leverage = undefined;
        if (base.adapterName != quote.adapterName) {
            throw (0, error_1.adapterMismatchError)();
        }
    }
}
exports.Instrument = Instrument;
function instrumentOf(selector) {
    const [adapterName, asset, ...rest] = selector.split(asset_1.AssetSelectorSeparator);
    if (!adapterName || !asset || rest.length) {
        throw (0, error_1.invalidInstrumentSelectorError)(selector);
    }
    const [baseAssetName, quoteAssetName] = asset.split(exports.InstrumentSelectorSeparator);
    if (!baseAssetName || !quoteAssetName) {
        throw (0, error_1.invalidInstrumentSelectorError)(selector);
    }
    return new InstrumentSelector(baseAssetName, quoteAssetName, adapterName);
}
exports.instrumentOf = instrumentOf;
