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
exports.AdapterAggregate = void 0;
const shared_1 = require("../shared");
const error_1 = require("./error");
/**
 * Manages instances of all adapters provided in session descriptor.
 * Awakes and disposes adapters, routes and executes commands.
 */
class AdapterAggregate {
    constructor(factories, timeProvider, store, cache) {
        this.factories = factories;
        this.timeProvider = timeProvider;
        this.store = store;
        this.cache = cache;
        this.adapter = {};
    }
    /**
     * Returns adapter by name.
     * @param adapterName adapter name.
     * @returns
     */
    get(adapterName) {
        const adapter = this.adapter[adapterName];
        if (!adapter) {
            throw (0, error_1.adapterNotFoundError)(adapterName);
        }
        return adapter;
    }
    /**
     * Sets up all adapters.
     */
    awake() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const factory of this.factories) {
                const adapter = factory(this.timeProvider, this.store, this.cache);
                try {
                    yield adapter.awake();
                    yield adapter.account();
                }
                catch (error) {
                    shared_1.Logger.error(adapter.name, error);
                }
                this.adapter[adapter.name] = adapter;
            }
        });
    }
    /**
     * Disposes all adapters.
     */
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const adapter of Object.values(this.adapter)) {
                try {
                    yield adapter.dispose();
                }
                catch (error) {
                    shared_1.Logger.error(adapter.name, error);
                }
            }
        });
    }
    /**
     * Subscribe to collection of instruments.
     * @param selectors
     */
    subscribe(selectors) {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = selectors.reduce((aggregate, it) => {
                const adapter = it.base.adapterName;
                if (aggregate[adapter]) {
                    aggregate[adapter].push(it);
                }
                else {
                    aggregate[adapter] = [it];
                }
                return aggregate;
            }, {});
            for (const adapterName in grouped) {
                shared_1.Logger.debug(adapterName, `subscribing for ${grouped[adapterName].join(', ')}`);
                try {
                    yield this.get(adapterName).subscribe(grouped[adapterName]);
                }
                catch (error) {
                    shared_1.Logger.error(adapterName, error);
                    throw error;
                }
            }
        });
    }
    /**
     * Opens new order.
     * @param order an order to open.
     */
    open(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const { adapterName } = order.instrument.base;
            shared_1.Logger.debug(adapterName, `opening a new order on ${order.instrument.toString()} as ${order.id}`);
            try {
                yield this.get(adapterName).open(order);
            }
            catch (error) {
                shared_1.Logger.error(adapterName, error);
                throw error;
            }
        });
    }
    /**
     * Cancels specific order.
     */
    cancel(order) {
        const { adapterName } = order.instrument.base;
        shared_1.Logger.debug(adapterName, `canceling a ${order.id} order`);
        try {
            return this.get(adapterName).cancel(order);
        }
        catch (error) {
            shared_1.Logger.error(adapterName, error);
            throw error;
        }
    }
    /**
     *
     * @returns
     */
    history(instrument, timeframe, length) {
        try {
            return this.get(instrument.base.adapterName).history(instrument, timeframe, length);
        }
        catch (error) {
            shared_1.Logger.error(instrument.base.adapterName, error);
            throw error;
        }
    }
    /**
     * Feeds a storage with historical instrument data.
     * @returns
     */
    feed(instrument, from, to, callback) {
        try {
            return this.get(instrument.base.adapterName).feed(instrument, from, to, callback);
        }
        catch (error) {
            shared_1.Logger.error(instrument.base.adapterName, error);
            throw error;
        }
    }
}
exports.AdapterAggregate = AdapterAggregate;
