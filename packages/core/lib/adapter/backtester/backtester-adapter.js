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
exports.BacktesterAdapter = exports.createBacktesterAdapterFactory = void 0;
const store_1 = require("../../store");
const __1 = require("..");
function createBacktesterAdapterFactory(decoratedAdapterFactory, streamer) {
    return (timeProvider, store, cache) => new BacktesterAdapter(decoratedAdapterFactory(timeProvider, store, cache), streamer, store);
}
exports.createBacktesterAdapterFactory = createBacktesterAdapterFactory;
class BacktesterAdapter extends __1.Adapter {
    constructor(decoratedAdapter, streamer, store) {
        super(streamer.getTimeProvider());
        this.decoratedAdapter = decoratedAdapter;
        this.streamer = streamer;
        this.store = store;
        this.name = this.decoratedAdapter.name;
    }
    awake() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.decoratedAdapter.awake();
        });
    }
    dispose() {
        return this.decoratedAdapter.dispose();
    }
    subscribe(instruments) {
        return __awaiter(this, void 0, void 0, function* () {
            instruments.forEach(it => {
                this.streamer.subscribe(it);
            });
            this.store.dispatch(...instruments.map(it => new store_1.InstrumentSubscriptionEvent(this.timestamp(), it, true)));
            this.streamer.tryContinue();
        });
    }
    account() {
        return this.decoratedAdapter.account();
    }
    open(order) {
        return this.decoratedAdapter.open(order);
    }
    cancel(order) {
        return this.decoratedAdapter.cancel(order);
    }
    history(instrument, timeframe, length) {
        return __awaiter(this, void 0, void 0, function* () {
            this.streamer.stop();
            const response = yield this.decoratedAdapter.history(instrument, timeframe, length);
            this.streamer.tryContinue();
            return response;
        });
    }
    feed(instrument, from, to, callback) {
        return this.decoratedAdapter.feed(instrument, from, to, callback);
    }
    createPaperEngine(adapter) {
        return this.decoratedAdapter.createPaperEngine(adapter);
    }
}
exports.BacktesterAdapter = BacktesterAdapter;
