"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceUnlockOrderEvent = exports.BalanceLockOrderEvent = exports.BalanceTransactEvent = exports.BalancePatchEvent = void 0;
const domain_1 = require("../domain");
const error_1 = require("./error");
/**
 * Updates the free and freezed balance of the given asset.
 */
class BalancePatchEvent {
    constructor(asset, free, freezed, timestamp) {
        this.asset = asset;
        this.free = free;
        this.freezed = freezed;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        /*
         * skip not tradeable assets (for example, you can have an unlisted
         * asset in your wallet).
         */
        const asset = state.universe.asset.get(this.asset.id);
        if (!asset) {
            return;
        }
        const balance = state.balance.tryGetOrSet(this.asset.id, () => new domain_1.Balance(0, asset));
        balance.timestamp = this.timestamp;
        balance.set(this.free, this.freezed);
        state.timestamp = this.timestamp;
        changes.commit(balance);
    }
}
exports.BalancePatchEvent = BalancePatchEvent;
/**
 *
 */
class BalanceTransactEvent {
    constructor(asset, amount, timestamp) {
        this.asset = asset;
        this.amount = amount;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const asset = state.universe.asset.get(this.asset.id);
        if (!asset) {
            throw (0, error_1.assetNotSupportedError)(this.asset);
        }
        const balance = state.balance.tryGetOrSet(this.asset.id, () => new domain_1.Balance(0, asset));
        balance.timestamp = this.timestamp;
        balance.account(this.amount);
        state.timestamp = this.timestamp;
        changes.commit(balance);
    }
}
exports.BalanceTransactEvent = BalanceTransactEvent;
/**
 *
 */
class BalanceLockOrderEvent {
    constructor(orderId, instrument, timestamp) {
        this.orderId = orderId;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        var _a, _b;
        const orders = state.order.get(this.instrument.id);
        if (!orders) {
            throw (0, error_1.instrumentNotSubscribedError)(this.instrument);
        }
        const order = orders.get(this.orderId);
        if (!order) {
            throw (0, error_1.orderNotFoundError)(this.orderId);
        }
        const base = state.balance.get(order.instrument.base.id);
        if (!base) {
            throw (0, error_1.balanceNotFoundError)(order.instrument.base);
        }
        const quote = state.balance.get(order.instrument.quote.id);
        if (!quote) {
            throw (0, error_1.balanceNotFoundError)(order.instrument.quote);
        }
        const balanceToLock = order.calculateBalanceToLock(base, quote);
        state.timestamp = this.timestamp;
        if ((_a = balanceToLock.base) === null || _a === void 0 ? void 0 : _a.greaterThan(0)) {
            base.timestamp = this.timestamp;
            base.lock(this.orderId, balanceToLock.base);
            changes.commit(base);
        }
        if ((_b = balanceToLock.quote) === null || _b === void 0 ? void 0 : _b.greaterThan(0)) {
            quote.timestamp = this.timestamp;
            quote.lock(this.orderId, balanceToLock.quote);
            changes.commit(quote);
        }
    }
}
exports.BalanceLockOrderEvent = BalanceLockOrderEvent;
/**
 *
 */
class BalanceUnlockOrderEvent {
    constructor(orderId, instrument, timestamp) {
        this.orderId = orderId;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const orders = state.order.get(this.instrument.id);
        if (!orders) {
            throw (0, error_1.instrumentNotSubscribedError)(this.instrument);
        }
        const order = orders.get(this.orderId);
        if (!order) {
            throw (0, error_1.orderNotFoundError)(this.orderId);
        }
        const base = state.balance.get(order.instrument.base.id);
        if (!base) {
            throw (0, error_1.balanceNotFoundError)(order.instrument.base);
        }
        const quote = state.balance.get(order.instrument.quote.id);
        if (!quote) {
            throw (0, error_1.balanceNotFoundError)(order.instrument.quote);
        }
        state.timestamp = this.timestamp;
        if (base.tryUnlock(this.orderId)) {
            base.timestamp = this.timestamp;
            changes.commit(base);
        }
        if (quote.tryUnlock(this.orderId)) {
            quote.timestamp = this.timestamp;
            changes.commit(quote);
        }
    }
}
exports.BalanceUnlockOrderEvent = BalanceUnlockOrderEvent;
