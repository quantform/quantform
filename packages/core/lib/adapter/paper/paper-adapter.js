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
exports.PaperAdapter = exports.createPaperAdapterFactory = void 0;
const domain_1 = require("../../domain");
const shared_1 = require("../../shared");
const store_1 = require("../../store");
const __1 = require("..");
const error_1 = require("../error");
function createPaperAdapterFactory(decoratedAdapterFactory, options) {
    return (timeProvider, store, cache) => new PaperAdapter(decoratedAdapterFactory(timeProvider, store, cache), store, options);
}
exports.createPaperAdapterFactory = createPaperAdapterFactory;
class PaperAdapter extends __1.Adapter {
    constructor(decoratedAdapter, store, options) {
        super({
            timestamp: () => this.decoratedAdapter.timestamp()
        });
        this.decoratedAdapter = decoratedAdapter;
        this.store = store;
        this.options = options;
        this.name = this.decoratedAdapter.name;
    }
    awake() {
        return __awaiter(this, void 0, void 0, function* () {
            this.engine = this.createPaperEngine(this);
            yield this.decoratedAdapter.awake();
        });
    }
    dispose() {
        return this.decoratedAdapter.dispose();
    }
    subscribe(instruments) {
        return this.decoratedAdapter.subscribe(instruments);
    }
    account() {
        return __awaiter(this, void 0, void 0, function* () {
            let subscribed = Object.values(this.store.snapshot.subscription.asset).filter(it => it.adapterName == this.name);
            for (const balance in this.options.balance) {
                const asset = (0, domain_1.assetOf)(balance);
                if (asset.adapterName != this.name) {
                    continue;
                }
                const free = (0, shared_1.d)(this.options.balance[balance]);
                subscribed = subscribed.filter(it => it.id != asset.id);
                this.store.dispatch(new store_1.BalancePatchEvent(asset, free, shared_1.d.Zero, this.timestamp()));
            }
            for (const missingAsset of subscribed) {
                this.store.dispatch(new store_1.BalancePatchEvent(missingAsset, shared_1.d.Zero, shared_1.d.Zero, this.timestamp()));
            }
        });
    }
    open(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.engine) {
                throw (0, error_1.noPaperEngineProvidedError)();
            }
            this.engine.open(order);
        });
    }
    cancel(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.engine) {
                throw (0, error_1.noPaperEngineProvidedError)();
            }
            this.engine.cancel(order);
        });
    }
    history(instrument, timeframe, length) {
        return this.decoratedAdapter.history(instrument, timeframe, length);
    }
    feed(instrument, from, to, callback) {
        return this.decoratedAdapter.feed(instrument, from, to, callback);
    }
    createPaperEngine(adapter) {
        return this.decoratedAdapter.createPaperEngine(adapter);
    }
}
exports.PaperAdapter = PaperAdapter;
