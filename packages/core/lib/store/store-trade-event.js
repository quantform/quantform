"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradePatchEvent = void 0;
const domain_1 = require("../domain");
const shared_1 = require("../shared");
const error_1 = require("./error");
/**
 * Patches a store with specific event @see TradePatchEvent
 * If there is no specific @see Trade in store, it will create a new one.
 */
class TradePatchEvent {
    constructor(instrument, rate, quantity, timestamp) {
        this.instrument = instrument;
        this.rate = rate;
        this.quantity = quantity;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        if (!state.subscription.instrument.get(this.instrument.id)) {
            throw (0, error_1.instrumentNotSubscribedError)(this.instrument);
        }
        const instrument = state.universe.instrument.get(this.instrument.id);
        if (!instrument) {
            throw (0, error_1.instrumentNotSupportedError)(this.instrument);
        }
        const trade = state.trade.tryGetOrSet(this.instrument.id, () => new domain_1.Trade(0, instrument, shared_1.d.Zero, shared_1.d.Zero));
        state.timestamp = this.timestamp;
        trade.timestamp = this.timestamp;
        trade.rate = trade.instrument.quote.floor(this.rate);
        trade.quantity = trade.instrument.base.floor(this.quantity);
        changes.commit(trade);
    }
}
exports.TradePatchEvent = TradePatchEvent;
