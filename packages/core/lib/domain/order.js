"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const shared_1 = require("../shared");
const error_1 = require("./error");
class Order {
    constructor(timestamp, id, instrument, quantity, createdAt, rate, stopRate) {
        this.timestamp = timestamp;
        this.id = id;
        this.instrument = instrument;
        this.quantity = quantity;
        this.createdAt = createdAt;
        this.rate = rate;
        this.stopRate = stopRate;
        this.kind = 'order';
        this.state = 'NEW';
        this.quantityExecuted = shared_1.d.Zero;
        if (!quantity || Number.isNaN(quantity)) {
            throw (0, error_1.invalidArgumentError)(quantity);
        }
        if (rate && rate.lessThanOrEqualTo(0)) {
            throw (0, error_1.invalidArgumentError)(rate);
        }
    }
    toString() {
        return this.id;
    }
    calculateBalanceToLock(base, quote) {
        const qty = this.quantity.abs();
        if (this.quantity.greaterThan(0)) {
            if (this.rate) {
                return {
                    base: shared_1.d.Zero,
                    quote: quote.asset.ceil(this.rate.mul(qty))
                };
            }
            else {
                return {
                    base: shared_1.d.Zero,
                    quote: quote.free
                };
            }
        }
        if (this.quantity.lessThan(0)) {
            return {
                base: qty,
                quote: shared_1.d.Zero
            };
        }
        return {};
    }
}
exports.Order = Order;
