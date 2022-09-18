"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binanceToCommission = exports.binanceToCandle = exports.binanceExecutionReportToEvents = exports.binanceOutboundAccountPositionToBalancePatchEvent = exports.binanceToOrderbookPatchEvent = exports.binanceToTradePatchEvent = exports.binanceToInstrumentPatchEvent = exports.binanceToOrderLoadEvent = exports.binanceToBalancePatchEvent = exports.timeframeToBinance = void 0;
const core_1 = require("@quantform/core");
const binance_adapter_1 = require("./binance-adapter");
function timeframeToBinance(timeframe) {
    switch (timeframe) {
        case core_1.Timeframe.M1:
            return '1m';
        case core_1.Timeframe.M5:
            return '5m';
        case core_1.Timeframe.M15:
            return '15m';
        case core_1.Timeframe.M30:
            return '30m';
        case core_1.Timeframe.H1:
            return '1h';
        case core_1.Timeframe.H6:
            return 'h6';
        case core_1.Timeframe.H12:
            return '12h';
        case core_1.Timeframe.D1:
            return '1d';
    }
    throw new Error(`unsupported timeframe: ${timeframe}`);
}
exports.timeframeToBinance = timeframeToBinance;
function binanceToBalancePatchEvent(response, timestamp) {
    const free = (0, core_1.d)(response.free);
    const locked = (0, core_1.d)(response.locked);
    return new core_1.BalancePatchEvent(new core_1.AssetSelector(response.asset.toLowerCase(), binance_adapter_1.BINANCE_ADAPTER_NAME), free, locked, timestamp);
}
exports.binanceToBalancePatchEvent = binanceToBalancePatchEvent;
function binanceToOrderLoadEvent(response, state, timestamp) {
    const instrument = state.universe.instrument
        .asReadonlyArray()
        .find(it => it.base.adapterName == binance_adapter_1.BINANCE_ADAPTER_NAME && response.symbol == it.raw);
    if (!instrument) {
        throw new Error();
    }
    const quantity = (0, core_1.d)(response.origQty);
    const order = new core_1.Order(timestamp, response.clientOrderId, instrument, response.side == 'BUY' ? quantity : quantity.mul(-1), response.time, response.price ? (0, core_1.d)(response.price) : undefined);
    order.externalId = `${response.orderId}`;
    order.state = 'PENDING';
    return new core_1.OrderLoadEvent(order, timestamp);
}
exports.binanceToOrderLoadEvent = binanceToOrderLoadEvent;
function binanceToInstrumentPatchEvent(response, timestamp) {
    const scale = {
        base: 8,
        quote: 8
    };
    for (const filter of response.filters) {
        switch (filter.filterType) {
            case 'PRICE_FILTER':
                scale.quote = (0, core_1.d)(filter.tickSize).decimalPlaces();
                break;
            case 'LOT_SIZE':
                scale.base = (0, core_1.d)(filter.stepSize).decimalPlaces();
                break;
        }
    }
    const base = new core_1.Asset(response.baseAsset, binance_adapter_1.BINANCE_ADAPTER_NAME, scale.base);
    const quote = new core_1.Asset(response.quoteAsset, binance_adapter_1.BINANCE_ADAPTER_NAME, scale.quote);
    return new core_1.InstrumentPatchEvent(timestamp, base, quote, (0, core_1.commissionPercentOf)({ maker: (0, core_1.d)(0.1), taker: (0, core_1.d)(0.1) }), response.symbol);
}
exports.binanceToInstrumentPatchEvent = binanceToInstrumentPatchEvent;
function binanceToTradePatchEvent(message, instrument, timestamp) {
    return new core_1.TradePatchEvent(instrument, (0, core_1.d)(message.p), (0, core_1.d)(message.q), timestamp);
}
exports.binanceToTradePatchEvent = binanceToTradePatchEvent;
function binanceToOrderbookPatchEvent(message, instrument, timestamp) {
    return new core_1.OrderbookPatchEvent(instrument, { rate: (0, core_1.d)(message.bestAsk), quantity: (0, core_1.d)(message.bestAskQty), next: undefined }, { rate: (0, core_1.d)(message.bestBid), quantity: (0, core_1.d)(message.bestBidQty), next: undefined }, timestamp);
}
exports.binanceToOrderbookPatchEvent = binanceToOrderbookPatchEvent;
function binanceOutboundAccountPositionToBalancePatchEvent(message, timestamp) {
    return new core_1.BalancePatchEvent(new core_1.AssetSelector(message.a.toLowerCase(), binance_adapter_1.BINANCE_ADAPTER_NAME), (0, core_1.d)(message.f), (0, core_1.d)(message.l), timestamp);
}
exports.binanceOutboundAccountPositionToBalancePatchEvent = binanceOutboundAccountPositionToBalancePatchEvent;
// eslint-disable-next-line complexity
function binanceExecutionReportToEvents(message, state, queuedOrderCompletionEvents, timestamp) {
    var _a, _b;
    const clientOrderId = ((_a = message.C) === null || _a === void 0 ? void 0 : _a.length) > 0 ? message.C : message.c;
    const instrument = state.universe.instrument
        .asReadonlyArray()
        .find(it => it.raw === message.s && it.base.adapterName === binance_adapter_1.BINANCE_ADAPTER_NAME);
    if (!instrument) {
        throw new Error();
    }
    const order = (_b = state.order.get(instrument.id)) === null || _b === void 0 ? void 0 : _b.get(clientOrderId);
    if (!order) {
        const quantity = (0, core_1.d)(message.q);
        const newOrder = new core_1.Order(timestamp, clientOrderId, instrument, message.S == 'BUY' ? quantity : quantity.mul(-1), message.T, (0, core_1.d)(message.p));
        newOrder.externalId = `${message.i}`;
        newOrder.state = 'NEW';
        return [
            new core_1.OrderNewEvent(newOrder, timestamp),
            new core_1.OrderPendingEvent(newOrder.id, instrument, timestamp)
        ];
    }
    if (!order.externalId) {
        order.externalId = `${message.i}`;
    }
    const averagePrice = message.o == 'LIMIT' ? (0, core_1.d)(message.p) : (0, core_1.d)(message.Z).div((0, core_1.d)(message.z));
    switch (message.X) {
        case 'NEW':
        case 'PARTIALLY_FILLED':
        case 'TRADE':
            if (order.state != 'PENDING') {
                return [new core_1.OrderPendingEvent(order.id, instrument, timestamp)];
            }
            break;
        case 'FILLED':
            queuedOrderCompletionEvents.push(new core_1.OrderFilledEvent(order.id, instrument, averagePrice, timestamp));
            break;
        case 'EXPIRED':
        case 'REJECTED':
        case 'CANCELED':
            return [
                new core_1.OrderCancelingEvent(order.id, instrument, timestamp),
                new core_1.OrderCanceledEvent(order.id, instrument, timestamp)
            ];
    }
    return [];
}
exports.binanceExecutionReportToEvents = binanceExecutionReportToEvents;
function binanceToCandle(response) {
    return new core_1.Candle(response[0], (0, core_1.d)(response[1]), (0, core_1.d)(response[2]), (0, core_1.d)(response[3]), (0, core_1.d)(response[4]), (0, core_1.d)(response[5]));
}
exports.binanceToCandle = binanceToCandle;
function binanceToCommission(response) {
    return new core_1.Commission((0, core_1.d)(response.makerCommission).div(100), (0, core_1.d)(response.takerCommission).div(100));
}
exports.binanceToCommission = binanceToCommission;
