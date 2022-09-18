"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentSubscriptionEvent = exports.InstrumentPatchEvent = void 0;
const domain_1 = require("../domain");
const error_1 = require("./error");
const store_state_1 = require("./store-state");
class InstrumentPatchEvent {
    constructor(timestamp, base, quote, commission, raw, leverage) {
        this.timestamp = timestamp;
        this.base = base;
        this.quote = quote;
        this.commission = commission;
        this.raw = raw;
        this.leverage = leverage;
    }
    handle(state, changes) {
        const selector = new domain_1.InstrumentSelector(this.base.name, this.quote.name, this.base.adapterName);
        const instrument = state.universe.instrument.tryGetOrSet(selector.id, () => {
            state.universe.asset.tryGetOrSet(this.base.id, () => new domain_1.Asset(this.base.name, this.base.adapterName, 8));
            state.universe.asset.tryGetOrSet(this.quote.id, () => new domain_1.Asset(this.quote.name, this.quote.adapterName, 8));
            state.order.tryGetOrSet(selector.id, () => new store_state_1.InnerSet(selector.id));
            return new domain_1.Instrument(0, this.base, this.quote, this.raw, domain_1.Commission.Zero);
        });
        instrument.timestamp = this.timestamp;
        instrument.commission = this.commission;
        if (this.leverage) {
            instrument.leverage = this.leverage;
        }
        changes.commit(instrument);
    }
}
exports.InstrumentPatchEvent = InstrumentPatchEvent;
class InstrumentSubscriptionEvent {
    constructor(timestamp, instrument, subscribed) {
        this.timestamp = timestamp;
        this.instrument = instrument;
        this.subscribed = subscribed;
    }
    handle(state, changes) {
        const instrument = state.universe.instrument.get(this.instrument.id);
        if (!instrument) {
            throw (0, error_1.instrumentNotSupportedError)(this.instrument);
        }
        if (this.subscribed) {
            const base = state.universe.asset.get(instrument.base.id);
            if (!base) {
                throw (0, error_1.assetNotSupportedError)(instrument.base);
            }
            const quote = state.universe.asset.get(instrument.quote.id);
            if (!quote) {
                throw (0, error_1.assetNotSupportedError)(instrument.quote);
            }
            state.subscription.instrument.upsert(instrument);
            state.subscription.asset.upsert(base);
            state.subscription.asset.upsert(quote);
        }
        changes.commit(instrument);
    }
}
exports.InstrumentSubscriptionEvent = InstrumentSubscriptionEvent;
