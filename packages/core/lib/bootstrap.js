"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bootstrap = void 0;
const adapter_1 = require("./adapter");
const error_1 = require("./cli/error");
const domain_1 = require("./domain");
const storage_1 = require("./storage");
const store_1 = require("./store");
class Bootstrap {
    constructor(descriptor) {
        this.descriptor = descriptor;
    }
    /**
     * Set session id.
     * @param id session id.
     */
    useSessionId(id) {
        if (id) {
            this.descriptor.id = id;
        }
        return this;
    }
    /**
     *
     * @param from
     * @param to
     */
    useBacktestPeriod(from, to) {
        if (!this.descriptor.simulation) {
            this.descriptor.simulation = {
                balance: {},
                from,
                to
            };
        }
        else {
            this.descriptor.simulation.from = from;
            this.descriptor.simulation.to = to;
        }
        return this;
    }
    /**
     * Starts a new backtest session.
     * @param listener backtest event listener.
     * @returns new session object.
     */
    backtest(listener) {
        var _a;
        const { simulation } = this.descriptor;
        if (!simulation) {
            throw (0, error_1.missingDescriptorParameterError)('simulation');
        }
        const store = new store_1.Store();
        const storage = (_a = this.descriptor.storage) !== null && _a !== void 0 ? _a : (0, storage_1.inMemoryStorageFactory)();
        const feed = new storage_1.Feed(storage('feed'));
        const cache = new storage_1.Cache(storage('cache'));
        const streamer = new adapter_1.BacktesterStreamer(store, feed, simulation, listener);
        const aggregate = new adapter_1.AdapterAggregate(this.descriptor.adapter.map(it => (0, adapter_1.createBacktesterAdapterFactory)((0, adapter_1.createPaperAdapterFactory)(it, simulation), streamer)), streamer.getTimeProvider(), store, cache);
        const session = new domain_1.Session(store, aggregate, this.descriptor);
        return [session, streamer];
    }
    /**
     * Starts a new paper session.
     * @returns new session object.
     */
    paper() {
        var _a;
        const { simulation } = this.descriptor;
        if (!simulation) {
            throw (0, error_1.missingDescriptorParameterError)('simulation');
        }
        const store = new store_1.Store();
        const storage = (_a = this.descriptor.storage) !== null && _a !== void 0 ? _a : (0, storage_1.inMemoryStorageFactory)();
        const cache = new storage_1.Cache(storage('cache'));
        const aggregate = new adapter_1.AdapterAggregate(this.descriptor.adapter.map(it => (0, adapter_1.createPaperAdapterFactory)(it, simulation)), adapter_1.DefaultTimeProvider, store, cache);
        return new domain_1.Session(store, aggregate, this.descriptor);
    }
    /**
     * Starts a new live session.
     * @returns new session object.
     */
    live() {
        var _a;
        const store = new store_1.Store();
        const storage = (_a = this.descriptor.storage) !== null && _a !== void 0 ? _a : (0, storage_1.inMemoryStorageFactory)();
        const cache = new storage_1.Cache(storage('cache'));
        const aggregate = new adapter_1.AdapterAggregate(this.descriptor.adapter, adapter_1.DefaultTimeProvider, store, cache);
        return new domain_1.Session(store, aggregate, this.descriptor);
    }
}
exports.Bootstrap = Bootstrap;
