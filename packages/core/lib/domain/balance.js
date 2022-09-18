"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
const shared_1 = require("../shared");
const error_1 = require("./error");
/**
 * Represents single asset balance in your wallet.
 */
class Balance {
    constructor(timestamp, asset) {
        this.timestamp = timestamp;
        this.asset = asset;
        this.kind = 'balance';
        this.locker = {};
        this.available = shared_1.d.Zero;
        this.unavailable = shared_1.d.Zero;
        /**
         * Collection of opened positions backed by this balance.
         */
        this.position = {};
        this.id = asset.id;
    }
    /**
     * Returns available amount to trade.
     */
    get free() {
        return this.asset.floor(this.available).add(this.getEstimatedUnrealizedPnL('CROSS'));
    }
    /**
     * Return locked amount for order.
     */
    get locked() {
        return this.unavailable;
    }
    /**
     * Return total amount of asset in wallet.
     * Represents a sum of free, locked and opened positions.
     */
    get total() {
        return this.asset
            .floor(this.available.add(this.unavailable))
            .add(this.getEstimatedUnrealizedPnL());
    }
    account(amount) {
        if (this.available.add(amount).lessThan(0)) {
            throw (0, error_1.insufficientFundsError)(this.id, amount, this.available);
        }
        this.available = this.available.add(amount);
    }
    set(free, locked) {
        this.available = free;
        this.unavailable = locked;
        this.locker = {};
    }
    /**
     * Lock specific amount of asset.
     * If you place new pending order, you will lock your balance to fund order.
     */
    lock(id, amount) {
        if (this.available.lessThan(amount)) {
            throw (0, error_1.insufficientFundsError)(this.id, amount, this.available);
        }
        if (this.locker[id]) {
            throw (0, error_1.invalidArgumentError)(id);
        }
        this.locker[id] = amount;
        this.available = this.available.minus(amount);
        this.unavailable = this.unavailable.plus(amount);
    }
    tryUnlock(id) {
        if (!this.locker[id]) {
            return false;
        }
        const amount = this.locker[id];
        delete this.locker[id];
        if (this.unavailable < amount) {
            throw (0, error_1.insufficientFundsError)(this.id, amount, this.unavailable);
        }
        this.available = this.available.add(amount);
        this.unavailable = this.unavailable.minus(amount);
        return true;
    }
    /**
     * Returns unrealized profit and loss for all positions backed by this balance.
     */
    getEstimatedUnrealizedPnL(mode) {
        return Object.values(this.position).reduce((aggregate, position) => {
            var _a;
            return aggregate.add(mode && mode != position.mode
                ? shared_1.d.Zero
                : (_a = position.estimatedUnrealizedPnL) !== null && _a !== void 0 ? _a : shared_1.d.Zero);
        }, shared_1.d.Zero);
    }
    getEstimatedMargin(mode) {
        return Object.values(this.position).reduce((aggregate, position) => (aggregate = aggregate.add(mode && mode != position.mode ? 0 : position.margin)), shared_1.d.Zero);
    }
    toString() {
        return this.asset.toString();
    }
}
exports.Balance = Balance;
