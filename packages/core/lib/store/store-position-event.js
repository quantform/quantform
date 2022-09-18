"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionPatchEvent = exports.PositionLoadEvent = void 0;
const domain_1 = require("../domain");
const error_1 = require("./error");
class PositionLoadEvent {
    constructor(position, timestamp) {
        this.position = position;
        this.timestamp = timestamp;
    }
    handle(state) {
        if (!state.subscription.instrument.get(this.position.instrument.id)) {
            throw (0, error_1.instrumentNotSubscribedError)(this.position.instrument);
        }
        this.position.timestamp = this.timestamp;
        const balance = state.balance.get(this.position.instrument.quote.id);
        if (!balance) {
            throw (0, error_1.balanceNotFoundError)(this.position.instrument.quote);
        }
        balance.position[this.position.id] = this.position;
        const orderbook = state.orderbook.get(this.position.instrument.id);
        if (orderbook) {
            const rate = this.position.size.greaterThanOrEqualTo(0)
                ? orderbook.bids.rate
                : orderbook.asks.rate;
            if (rate) {
                this.position.calculateEstimatedUnrealizedPnL(rate);
            }
        }
    }
}
exports.PositionLoadEvent = PositionLoadEvent;
class PositionPatchEvent {
    constructor(id, instrument, rate, size, leverage, mode, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.rate = rate;
        this.size = size;
        this.leverage = leverage;
        this.mode = mode;
        this.timestamp = timestamp;
    }
    // eslint-disable-next-line complexity
    handle(state, changes) {
        if (!state.subscription.instrument.get(this.instrument.id)) {
            throw (0, error_1.instrumentNotSubscribedError)(this.instrument);
        }
        const balance = state.balance.get(this.instrument.quote.id);
        if (!balance) {
            throw (0, error_1.balanceNotFoundError)(this.instrument.quote);
        }
        const orderbook = state.orderbook.get(this.instrument.id);
        let position = balance.position[this.id];
        if (this.size.equals(0)) {
            if (position) {
                position.averageExecutionRate = this.instrument.quote.floor(this.rate);
                position.size = this.instrument.base.floor(this.size);
                position.leverage = this.leverage;
                delete balance.position[this.id];
                if (orderbook) {
                    const rate = position.size.greaterThanOrEqualTo(0)
                        ? orderbook.bids.rate
                        : orderbook.asks.rate;
                    if (rate) {
                        position.calculateEstimatedUnrealizedPnL(rate);
                    }
                }
                changes.commit(position);
                changes.commit(balance);
            }
        }
        const size = (position.size = this.instrument.base.floor(this.size));
        const averageExecutionRate = (position.averageExecutionRate =
            this.instrument.quote.floor(this.rate));
        if (!position) {
            position = new domain_1.Position(this.timestamp, this.id, this.instrument, this.mode, averageExecutionRate, size, this.leverage);
            balance.position[this.id] = position;
        }
        else {
            position.averageExecutionRate = averageExecutionRate;
            position.size = size;
            position.leverage = this.leverage;
        }
        if (orderbook) {
            const rate = position.size.greaterThanOrEqualTo(0)
                ? orderbook.bids.rate
                : orderbook.asks.rate;
            if (rate) {
                position.calculateEstimatedUnrealizedPnL(rate);
            }
        }
        changes.commit(position);
        changes.commit(balance);
    }
}
exports.PositionPatchEvent = PositionPatchEvent;
