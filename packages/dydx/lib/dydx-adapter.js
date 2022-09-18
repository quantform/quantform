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
exports.DyDxAdapter = exports.dydx = exports.DyDxOptions = exports.dydxCacheKey = exports.DYDX_ADAPTER_NAME = void 0;
const core_1 = require("@quantform/core");
const dydx_connector_1 = require("./dydx-connector");
const dydx_mapper_1 = require("./dydx-mapper");
const error_1 = require("./error");
exports.DYDX_ADAPTER_NAME = 'dydx';
function dydxCacheKey(key) {
    return {
        key: `${exports.DYDX_ADAPTER_NAME}:${key}`
    };
}
exports.dydxCacheKey = dydxCacheKey;
exports.DyDxOptions = {
    Mainnet: {
        http: 'https://api.dydx.exchange',
        ws: 'wss://api.dydx.exchange/v3/ws',
        networkId: 1
    },
    Ropsten: {
        http: 'https://api.stage.dydx.exchange',
        ws: 'wss://api.stage.dydx.exchange/v3/ws',
        networkId: 3
    }
};
function dydx(options) {
    return (timeProvider, store, cache) => {
        const connector = new dydx_connector_1.DyDxConnector(options !== null && options !== void 0 ? options : exports.DyDxOptions.Mainnet);
        return new DyDxAdapter(connector, store, cache, timeProvider);
    };
}
exports.dydx = dydx;
class DyDxAdapter extends core_1.Adapter {
    constructor(connector, store, cache, timeProvider) {
        super(timeProvider);
        this.connector = connector;
        this.store = store;
        this.cache = cache;
        this.name = exports.DYDX_ADAPTER_NAME;
        this.quote = new core_1.AssetSelector('usd', exports.DYDX_ADAPTER_NAME);
    }
    createPaperEngine(adapter) {
        return new core_1.PaperEngine(adapter.store);
    }
    awake() {
        return __awaiter(this, void 0, void 0, function* () {
            const { markets } = yield this.cache.tryGet(() => this.connector.getMarkets(), dydxCacheKey('get-markets'));
            this.store.dispatch(...Object.values(markets).map(it => (0, dydx_mapper_1.dydxToInstrumentPatchEvent)(it, this.timestamp())));
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connector.dispose();
        });
    }
    account() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connector.onboard();
            yield this.connector.account(it => {
                const timestamp = (0, core_1.now)();
                if (it.type == 'subscribed') {
                    const instruments = this.store.snapshot.universe.instrument.asReadonlyArray();
                    this.store.dispatch((0, dydx_mapper_1.dydxToBalanceSnapshotPatchEvent)(this.quote, it, timestamp), ...it.contents.orders.map(it => (0, dydx_mapper_1.dydxToOrderLoadEvent)(it, instruments, timestamp)));
                }
            });
        });
    }
    subscribe(selectors) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const selector of selectors) {
                const instrument = this.store.snapshot.universe.instrument.get(selector.id);
                if (!instrument) {
                    throw (0, error_1.instrumentNotFoundError)(selector);
                }
                this.store.dispatch(new core_1.InstrumentSubscriptionEvent(this.timestamp(), instrument, true));
                this.connector.trades(instrument.raw, message => {
                    if (message.type != 'subscribed') {
                        message.contents.trades.forEach(it => this.store.dispatch((0, dydx_mapper_1.dydxToTradePatchEvent)(it, instrument)));
                    }
                });
                const asks = new core_1.PriorityList(core_1.LiquidityAskComparer, it => it.rate.toString());
                const bids = new core_1.PriorityList(core_1.LiquidityBidComparer, it => it.rate.toString());
                this.connector.orderbook(instrument.raw, message => {
                    const timestamp = this.timestamp();
                    const { contents } = message;
                    if (message.type == 'subscribed') {
                        asks.clear();
                        bids.clear();
                        contents.asks.forEach(it => (0, dydx_mapper_1.dydxOrderbookPatchSnapshot)(asks, it));
                        contents.bids.forEach(it => (0, dydx_mapper_1.dydxOrderbookPatchSnapshot)(bids, it));
                    }
                    else {
                        const offset = parseInt(contents.offset);
                        contents.asks.forEach(it => (0, dydx_mapper_1.dydxOrderbookPatchUpdate)(asks, it, offset));
                        contents.bids.forEach(it => (0, dydx_mapper_1.dydxOrderbookPatchUpdate)(bids, it, offset));
                    }
                    this.store.dispatch((0, dydx_mapper_1.dydxToOrderbookPatchEvent)(instrument, asks, bids, timestamp));
                });
            }
        });
    }
    open(order) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
    cancel(order) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
    history(instrument, timeframe, length) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
    feed(selector, from, to, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const instrument = this.store.snapshot.universe.instrument.get(selector.id);
            if (!instrument) {
                throw (0, error_1.instrumentNotFoundError)(selector);
            }
            let curr = to;
            while (curr > from) {
                const { trades } = yield this.connector.getTrades(instrument.raw, curr);
                if (!trades.length) {
                    break;
                }
                const events = trades.map(it => (0, dydx_mapper_1.dydxToTradePatchEvent)(it, selector)).reverse();
                const filtered = events.filter(it => it.timestamp >= from);
                yield callback(from + Math.abs(curr - to), filtered);
                if (filtered.length != events.length) {
                    break;
                }
                curr = events[0].timestamp - 1;
                yield new Promise(resolve => setTimeout(resolve, 300));
            }
        });
    }
}
exports.DyDxAdapter = DyDxAdapter;
