"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = exports.assetOf = exports.AssetSelector = exports.AssetSelectorSeparator = void 0;
const decimals_1 = require("./../shared/decimals");
const error_1 = require("./error");
exports.AssetSelectorSeparator = ':';
/**
 * Supposed to query specific @see Asset based on string notation.
 */
class AssetSelector {
    constructor(name, adapterName) {
        if (!(name === null || name === void 0 ? void 0 : name.length)) {
            throw (0, error_1.invalidArgumentError)(name);
        }
        if (!(adapterName === null || adapterName === void 0 ? void 0 : adapterName.length)) {
            throw (0, error_1.invalidArgumentError)(adapterName);
        }
        this.name = name.toLowerCase();
        this.adapterName = adapterName.toLowerCase();
        this.id = `${this.adapterName}${exports.AssetSelectorSeparator}${this.name}`;
    }
    /**
     * Returns unified notation of the asset.
     */
    toString() {
        return this.id;
    }
}
exports.AssetSelector = AssetSelector;
/**
 * Creates @see AssetSelector based on unified string notation.
 */
function assetOf(selector) {
    const [adapterName, name, ...rest] = selector.split(exports.AssetSelectorSeparator);
    if (!adapterName || !name || rest.length) {
        throw (0, error_1.invalidAssetSelectorError)(selector);
    }
    return new AssetSelector(name, adapterName);
}
exports.assetOf = assetOf;
/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
class Asset extends AssetSelector {
    constructor(name, adapterName, scale) {
        super(name, adapterName);
        this.scale = scale;
        if (scale && (scale < 0 || Number.isNaN(scale))) {
            throw (0, error_1.invalidArgumentError)(scale);
        }
        this.tickSize = (0, decimals_1.d)(1.0).div(Math.pow(10, this.scale));
    }
    /**
     * Rounds down a number to the asset precision.
     */
    floor(number) {
        return number.toFloor(this.scale);
    }
    /**
     * Rounds up a number to the asset precision.
     */
    ceil(number) {
        return number.toCeil(this.scale);
    }
}
exports.Asset = Asset;
