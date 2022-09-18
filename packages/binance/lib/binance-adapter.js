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
exports.BinanceAdapter = exports.binance = exports.binanceCacheKey = exports.BINANCE_ADAPTER_NAME = void 0;
const core_1 = require("@quantform/core");
const binance_connector_1 = require("./binance-connector");
const binance_mapper_1 = require("./binance-mapper");
exports.BINANCE_ADAPTER_NAME = 'binance';
function binanceCacheKey(key) {
    return {
        key: `${exports.BINANCE_ADAPTER_NAME}:${key}`
    };
}
exports.binanceCacheKey = binanceCacheKey;
function binance(options) {
    return (timeProvider, store, cache) => {
        var _a, _b;
        const connector = new binance_connector_1.BinanceConnector((_a = options === null || options === void 0 ? void 0 : options.key) !== null && _a !== void 0 ? _a : (0, core_1.getEnvVar)('QF_BINANCE_APIKEY'), (_b = options === null || options === void 0 ? void 0 : options.secret) !== null && _b !== void 0 ? _b : (0, core_1.getEnvVar)('QF_BINANCE_APISECRET'));
        return new BinanceAdapter(connector, store, cache, timeProvider);
    };
}
exports.binance = binance;
class BinanceAdapter extends core_1.Adapter {
    constructor(connector, store, cache, timeProvider) {
        super(timeProvider);
        this.connector = connector;
        this.store = store;
        this.cache = cache;
        this.name = exports.BINANCE_ADAPTER_NAME;
        this.queuedOrderCompletionEvents = [];
    }
    createPaperEngine(adapter) {
        return new core_1.PaperEngine(adapter.store);
    }
    awake() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connector.useServerTime();
            const response = yield this.cache.tryGet(() => this.connector.getExchangeInfo(), binanceCacheKey('exchange-info'));
            this.store.dispatch(...response.symbols.map(it => (0, binance_mapper_1.binanceToInstrumentPatchEvent)(it, this.timestamp())));
        });
    }
    dispose() {
        return this.connector.unsubscribe();
    }
    account() {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.connector.account();
            const orders = yield this.connector.openOrders();
            const timestamp = this.timestamp();
            const commission = (0, binance_mapper_1.binanceToCommission)(account);
            this.store.dispatch(...this.store.snapshot.universe.instrument
                .asReadonlyArray()
                .map(it => new core_1.InstrumentPatchEvent(timestamp, it.base, it.quote, commission, it.id)), ...account.balances.map(it => (0, binance_mapper_1.binanceToBalancePatchEvent)(it, timestamp)), ...orders.map(it => (0, binance_mapper_1.binanceToOrderLoadEvent)(it, this.store.snapshot, timestamp)));
            yield this.connector.userData(message => this.store.dispatch(...(0, binance_mapper_1.binanceExecutionReportToEvents)(message, this.store.snapshot, this.queuedOrderCompletionEvents, this.timestamp())), message => {
                var _a, _b;
                return this.store.dispatch(...((_b = (_a = message.B) === null || _a === void 0 ? void 0 : _a.map(it => (0, binance_mapper_1.binanceOutboundAccountPositionToBalancePatchEvent)(it, this.timestamp()))) !== null && _b !== void 0 ? _b : []), ...this.queuedOrderCompletionEvents.splice(0, this.queuedOrderCompletionEvents.length));
            });
        });
    }
    subscribe(selectors) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const selector of selectors) {
                const instrument = this.store.snapshot.universe.instrument.get(selector.id);
                if (!instrument) {
                    throw new Error('Instrument not supported');
                }
                if (this.store.snapshot.subscription.instrument.get(instrument.id)) {
                    continue;
                }
                this.store.dispatch(new core_1.InstrumentSubscriptionEvent(this.timestamp(), instrument, true));
                yield this.connector.trades(instrument.raw, message => this.store.dispatch((0, binance_mapper_1.binanceToTradePatchEvent)(message, instrument, this.timestamp())));
                yield this.connector.bookTickers(instrument.raw, message => this.store.dispatch((0, binance_mapper_1.binanceToOrderbookPatchEvent)(message, instrument, this.timestamp())));
            }
        });
    }
    open(order) {
        return __awaiter(this, void 0, void 0, function* () {
            this.store.dispatch(new core_1.OrderNewEvent(order, this.timestamp()), new core_1.BalanceLockOrderEvent(order.id, order.instrument, this.timestamp()));
            const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
            if (!instrument) {
                throw new Error('Instrument not supported');
            }
            try {
                const response = yield this.connector.open(Object.assign(Object.assign({}, order), { symbol: instrument.raw, scale: instrument.quote.scale }));
                if (!order.externalId) {
                    order.externalId = `${response.orderId}`;
                }
                if (response.status == 'NEW' && order.state != 'PENDING') {
                    this.store.dispatch(new core_1.OrderPendingEvent(order.id, order.instrument, this.timestamp()));
                }
            }
            catch (e) {
                this.store.dispatch(new core_1.BalanceUnlockOrderEvent(order.id, order.instrument, this.timestamp()), new core_1.OrderRejectedEvent(order.id, order.instrument, this.timestamp()));
            }
        });
    }
    cancel(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!order.externalId) {
                throw new Error('Order is not sent');
            }
            const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
            if (!instrument) {
                throw new Error('Instrument not supported');
            }
            this.store.dispatch(new core_1.OrderCancelingEvent(order.id, instrument, this.timestamp()));
            try {
                yield this.connector.cancel({
                    symbol: instrument.raw,
                    externalId: order.externalId
                });
                this.store.dispatch(new core_1.OrderCanceledEvent(order.id, instrument, this.timestamp()));
            }
            catch (e) {
                this.store.dispatch(new core_1.OrderCancelFailedEvent(order.id, instrument, this.timestamp()));
            }
        });
    }
    history(selector, timeframe, length) {
        return __awaiter(this, void 0, void 0, function* () {
            const instrument = this.store.snapshot.universe.instrument.get(selector.id);
            if (!instrument) {
                throw new Error('Instrument not supported');
            }
            const response = yield this.connector.candlesticks(instrument.raw, (0, binance_mapper_1.timeframeToBinance)(timeframe), {
                limit: length,
                endTime: (0, core_1.tf)(this.timestamp(), timeframe)
            });
            return response.map(it => (0, binance_mapper_1.binanceToCandle)(it));
        });
    }
    feed(selector, from, to, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const instrument = this.store.snapshot.universe.instrument.get(selector.id);
            if (!instrument) {
                throw new Error('Instrument not supported');
            }
            const count = 1000;
            while (from < to) {
                const response = yield this.connector.candlesticks(instrument.raw, (0, binance_mapper_1.timeframeToBinance)(core_1.Timeframe.M1), {
                    limit: count,
                    startTime: from,
                    endTime: to
                });
                if (!response.length) {
                    break;
                }
                const events = response.map(it => {
                    var _a;
                    const candle = (0, binance_mapper_1.binanceToCandle)(it);
                    return new core_1.TradePatchEvent(instrument, candle.close, (_a = candle.volume) !== null && _a !== void 0 ? _a : core_1.d.Zero, candle.timestamp);
                });
                yield callback(from, events);
                from = response[response.length - 1][0] + 1;
                yield new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    }
}
exports.BinanceAdapter = BinanceAdapter;
