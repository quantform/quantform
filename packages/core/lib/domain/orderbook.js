"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orderbook = exports.LiquidityBidComparer = exports.LiquidityAskComparer = void 0;
const LiquidityAskComparer = (lhs, rhs) => lhs.rate.comparedTo(rhs.rate);
exports.LiquidityAskComparer = LiquidityAskComparer;
const LiquidityBidComparer = (lhs, rhs) => rhs.rate.comparedTo(lhs.rate);
exports.LiquidityBidComparer = LiquidityBidComparer;
/**
 * Provides an access to pending buy and sell orders on the specific market.
 */
class Orderbook {
    constructor(timestamp, instrument, asks, bids) {
        this.timestamp = timestamp;
        this.instrument = instrument;
        this.asks = asks;
        this.bids = bids;
        this.kind = 'orderbook';
        this.id = instrument.id;
    }
    toString() {
        return this.instrument.toString();
    }
}
exports.Orderbook = Orderbook;
