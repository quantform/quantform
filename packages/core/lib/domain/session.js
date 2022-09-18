"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const domain_1 = require("../domain");
const shared_1 = require("../shared");
const balance_operator_1 = require("./balance-operator");
const instrument_operator_1 = require("./instrument-operator");
const order_operator_1 = require("./order-operator");
const orderbook_operator_1 = require("./orderbook-operator");
const position_operator_1 = require("./position-operator");
const trade_operator_1 = require("./trade-operator");
class Session {
    constructor(store, aggregate, descriptor) {
        this.store = store;
        this.aggregate = aggregate;
        this.descriptor = descriptor;
        this.initialized = false;
        // generate session id based on time if not provided.
        if (descriptor && !descriptor.id) {
            descriptor.id = (0, shared_1.now)();
        }
    }
    get timestamp() {
        return this.store.snapshot.timestamp;
    }
    awake(describe) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized) {
                return;
            }
            this.initialized = true;
            // awake all adapters and synchronize trading accounts with store.
            yield this.aggregate.awake();
            if (describe) {
                this.subscription = describe(this)
                    .pipe((0, rxjs_1.finalize)(() => this.dispose()))
                    .subscribe();
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                return;
            }
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
            }
            this.store.dispose();
            yield this.aggregate.dispose();
            this.initialized = false;
        });
    }
    /**
     * Subscribes to specific instrument. Usually forces adapter to subscribe
     * for orderbook and ticker streams.
     */
    subscribe(instrument) {
        return this.aggregate.subscribe(instrument);
    }
    /**
     * Opens a new order.
     */
    open(order) {
        const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
        if (!instrument) {
            throw (0, domain_1.invalidInstrumentSelectorError)(order.instrument.id);
        }
        const newOrder = new domain_1.Order(this.timestamp, (0, uuid_1.v4)(), instrument, order.quantity, this.timestamp, order.rate);
        return (0, rxjs_1.of)(newOrder).pipe((0, rxjs_1.switchMap)(() => this.aggregate.open(newOrder)), (0, rxjs_1.switchMap)(() => this.order(order.instrument).pipe((0, rxjs_1.filter)(it => it.id == newOrder.id))));
    }
    /**
     * Cancels specific order.
     */
    cancel(order) {
        return (0, rxjs_1.defer)(() => (0, rxjs_1.from)(this.aggregate.cancel(order))).pipe((0, rxjs_1.switchMap)(() => this.order(order.instrument).pipe((0, rxjs_1.filter)(it => it.id == order.id))));
    }
    /**
     * Subscribes to specific instrument changes.
     * When adapter awake then it will fetch collection of all available instruments.
     */
    instrument(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, instrument_operator_1.instrument)(selector, this.store.snapshot));
    }
    /**
     * Subscribes to instruments changes.
     * When adapter awake then it will fetch collection of all available instruments.
     */
    instruments() {
        return this.store.changes$.pipe((0, instrument_operator_1.instruments)(this.store.snapshot));
    }
    /**
     * Subscribes to balance changes.
     */
    balance(selector) {
        return this.store.changes$.pipe((0, balance_operator_1.balance)(selector, this.store.snapshot));
    }
    /**
     * Subscribes to trade/ticker changes.
     */
    trade(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, trade_operator_1.trade)(selector, this.store.snapshot));
    }
    /**
     * Subscribes to orderbook changes.
     * Right now you can access only best bid and best ask.
     */
    orderbook(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, orderbook_operator_1.orderbook)(selector, this.store.snapshot));
    }
    /**
     * Subscribes to position on leveraged market.
     */
    position(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, position_operator_1.position)(selector));
    }
    /**
     * Subscribes to positions on leveraged markets.
     */
    positions(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, position_operator_1.positions)(selector, this.store.snapshot));
    }
    order(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, order_operator_1.order)(selector));
    }
    orders(selector) {
        this.subscribe([selector]);
        return this.store.changes$.pipe((0, order_operator_1.orders)(selector, this.store.snapshot));
    }
    history(selector, timeframe, length) {
        return this.store.changes$.pipe((0, rxjs_1.startWith)(this.store.snapshot.universe.instrument.get(selector.id)), (0, rxjs_1.filter)(it => it instanceof domain_1.Instrument && it.id == selector.id), (0, rxjs_1.switchMap)(() => (0, rxjs_1.from)(this.aggregate.history(selector, timeframe, length))), (0, rxjs_1.take)(1), (0, rxjs_1.shareReplay)(), (0, rxjs_1.mergeMap)(it => it));
    }
}
exports.Session = Session;
