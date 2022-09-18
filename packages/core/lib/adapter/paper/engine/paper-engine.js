"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperEngine = void 0;
const rxjs_1 = require("rxjs");
const domain_1 = require("../../../domain");
const shared_1 = require("../../../shared");
const store_1 = require("../../../store");
const error_1 = require("../../../store/error");
class PaperEngine {
    constructor(store) {
        this.store = store;
        store.changes$
            .pipe((0, rxjs_1.tap)(it => {
            if (it instanceof domain_1.Orderbook) {
                this.onOrderbook(it);
            }
            else if (it instanceof domain_1.Trade) {
                this.onTrade(it);
            }
        }))
            .subscribe();
    }
    open(order) {
        const { timestamp } = this.store.snapshot;
        try {
            this.store.dispatch(new store_1.OrderNewEvent(order, timestamp), new store_1.BalanceLockOrderEvent(order.id, order.instrument, timestamp));
            this.store.dispatch(new store_1.OrderPendingEvent(order.id, order.instrument, timestamp));
        }
        catch (error) {
            this.store.dispatch(new store_1.BalanceUnlockOrderEvent(order.id, order.instrument, timestamp), new store_1.OrderRejectedEvent(order.id, order.instrument, timestamp));
        }
    }
    cancel(order) {
        const { timestamp } = this.store.snapshot;
        this.store.dispatch(new store_1.OrderCancelingEvent(order.id, order.instrument, timestamp));
        this.store.dispatch(new store_1.BalanceUnlockOrderEvent(order.id, order.instrument, timestamp), new store_1.OrderCanceledEvent(order.id, order.instrument, timestamp));
    }
    onOrderbook(orderbook) {
        const orders = this.store.snapshot.order.get(orderbook.instrument.id);
        if (!orders) {
            return;
        }
        orders.asReadonlyArray().forEach(it => {
            if (it.state != 'PENDING') {
                return;
            }
            if (it.rate) {
                if (it.quantity.greaterThan(0) && it.rate.greaterThan(orderbook.asks.rate)) {
                    this.completeOrder(it, orderbook.asks.rate);
                }
                else if (it.quantity.lessThan(0) && it.rate.lessThan(orderbook.bids.rate)) {
                    this.completeOrder(it, orderbook.bids.rate);
                }
            }
            else {
                if (it.quantity.greaterThan(0)) {
                    this.completeOrder(it, orderbook.asks.rate);
                }
                else if (it.quantity.lessThan(0)) {
                    this.completeOrder(it, orderbook.bids.rate);
                }
            }
        });
    }
    onTrade(trade) {
        const orders = this.store.snapshot.order.get(trade.instrument.id);
        if (!orders) {
            return;
        }
        orders.asReadonlyArray().forEach(it => {
            if (it.state != 'PENDING') {
                return;
            }
            if (it.rate) {
                if (it.quantity.greaterThan(0) && it.rate.greaterThan(trade.rate)) {
                    this.completeOrder(it, trade.rate);
                }
                else if (it.quantity.lessThan(0) && it.rate.lessThan(trade.rate)) {
                    this.completeOrder(it, trade.rate);
                }
            }
            else {
                this.completeOrder(it, trade.rate);
            }
        });
    }
    completeOrder(order, averageExecutionRate) {
        const { timestamp } = this.store.snapshot;
        const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
        if (!instrument) {
            throw (0, error_1.instrumentNotSupportedError)(order.instrument);
        }
        const transacted = {
            base: shared_1.d.Zero,
            quote: shared_1.d.Zero
        };
        const qty = order.quantity.abs();
        if (order.quantity.greaterThan(0)) {
            transacted.base = transacted.base.plus(instrument.base.floor(instrument.commission.applyMakerFee(qty)));
            transacted.quote = transacted.quote.minus(instrument.quote.floor(averageExecutionRate.mul(qty)));
        }
        else if (order.quantity.lessThan(0)) {
            transacted.base = transacted.base.minus(instrument.base.floor(qty));
            transacted.quote = transacted.quote.plus(instrument.quote.floor(instrument.commission.applyMakerFee(averageExecutionRate.mul(qty))));
        }
        this.store.dispatch(new store_1.BalanceUnlockOrderEvent(order.id, order.instrument, timestamp), new store_1.OrderFilledEvent(order.id, order.instrument, averageExecutionRate, timestamp), new store_1.BalanceTransactEvent(instrument.base, transacted.base, timestamp), new store_1.BalanceTransactEvent(instrument.quote, transacted.quote, timestamp));
    }
}
exports.PaperEngine = PaperEngine;
