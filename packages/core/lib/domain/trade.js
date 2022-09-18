"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
class Trade {
    constructor(timestamp, instrument, rate, quantity) {
        this.timestamp = timestamp;
        this.instrument = instrument;
        this.rate = rate;
        this.quantity = quantity;
        this.kind = 'trade';
        this.id = instrument.id;
    }
    toString() {
        return this.instrument.toString();
    }
}
exports.Trade = Trade;
