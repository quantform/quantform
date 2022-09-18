"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookPatchEvent = void 0;
const domain_1 = require("../domain");
const error_1 = require("./error");
class OrderbookPatchEvent {
    constructor(instrument, ask, bid, timestamp) {
        this.instrument = instrument;
        this.ask = ask;
        this.bid = bid;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const instrument = state.universe.instrument.get(this.instrument.id);
        if (!instrument) {
            throw (0, error_1.instrumentNotSupportedError)(this.instrument);
        }
        const orderbook = state.orderbook.tryGetOrSet(this.instrument.id, () => new domain_1.Orderbook(0, instrument, this.ask, this.bid));
        state.timestamp = this.timestamp;
        orderbook.timestamp = this.timestamp;
        orderbook.asks = this.ask;
        orderbook.bids = this.bid;
        const quote = state.balance.get(orderbook.instrument.quote.id);
        if (quote) {
            for (const position of Object.values(quote.position)) {
                if (position.instrument.id != orderbook.instrument.id) {
                    continue;
                }
                const rate = position.size.greaterThanOrEqualTo(0)
                    ? orderbook.bids.rate
                    : orderbook.asks.rate;
                if (rate) {
                    position.calculateEstimatedUnrealizedPnL(rate);
                }
            }
            if (quote.total.lessThan(0)) {
                throw (0, error_1.liquidationError)();
            }
        }
        changes.commit(orderbook);
    }
}
exports.OrderbookPatchEvent = OrderbookPatchEvent;
