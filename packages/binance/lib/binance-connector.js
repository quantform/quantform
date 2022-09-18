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
exports.BinanceConnector = void 0;
const core_1 = require("@quantform/core");
const binance_adapter_1 = require("./binance-adapter");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Binance = require('node-binance-api');
class BinanceConnector {
    constructor(apiKey, apiSecret) {
        this.endpoint = new Binance().options({
            APIKEY: apiKey,
            APISECRET: apiSecret,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            log: (message) => core_1.Logger.info(binance_adapter_1.BINANCE_ADAPTER_NAME, message)
        });
    }
    useServerTime() {
        return this.endpoint.useServerTime();
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const key in this.endpoint.websockets.subscriptions()) {
                yield this.endpoint.websockets.terminate(key);
            }
        });
    }
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, core_1.retry)(() => this.endpoint.exchangeInfo());
        });
    }
    trades(symbol, handler) {
        return this.endpoint.websockets.trades(symbol, handler);
    }
    bookTickers(symbol, handler) {
        return this.endpoint.websockets.bookTickers(symbol, handler);
    }
    candlesticks(symbol, timeframe, params) {
        return (0, core_1.retry)(() => this.endpoint.candlesticks(symbol, timeframe, false, params));
    }
    userData(executionReportHandler, outboundAccountPositionHandler) {
        const handler = (message) => {
            switch (message.e) {
                case 'executionReport':
                    executionReportHandler(message);
                    break;
                case 'outboundAccountPosition':
                    outboundAccountPositionHandler(message);
                    break;
                default:
                    throw new Error('Unsupported event type.');
            }
        };
        return this.endpoint.websockets.userData(handler, handler);
    }
    account() {
        return (0, core_1.retry)(() => this.endpoint.account());
    }
    openOrders() {
        return (0, core_1.retry)(() => this.endpoint.openOrders());
    }
    open({ id, symbol, quantity, rate, scale }) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            if (rate) {
                if (quantity.greaterThan(0)) {
                    response = yield this.endpoint.buy(symbol, quantity.toFixed(), rate.toFloor(scale), {
                        newClientOrderId: id
                    });
                }
                else if (quantity.lessThan(0)) {
                    response = yield this.endpoint.sell(symbol, quantity.abs().toFixed(), rate.toFloor(scale), {
                        newClientOrderId: id
                    });
                }
            }
            else {
                if (quantity.greaterThan(0)) {
                    response = yield this.endpoint.marketBuy(symbol, quantity.toFixed(), {
                        newClientOrderId: id
                    });
                }
                else if (quantity.lessThan(0)) {
                    response = yield this.endpoint.marketSell(symbol, quantity.abs().toFixed(), {
                        newClientOrderId: id
                    });
                }
            }
            if (response.msg) {
                throw new Error(response.msg);
            }
            return response;
        });
    }
    cancel(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.endpoint.cancel(order.symbol, order.externalId);
            if (response.statusCode == 400) {
                throw new Error(response.msg);
            }
        });
    }
}
exports.BinanceConnector = BinanceConnector;
