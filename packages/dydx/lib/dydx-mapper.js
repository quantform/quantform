"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dydxToOrderLoadEvent = exports.dydxToBalanceSnapshotPatchEvent = exports.dydxToOrderbookPatchEvent = exports.dydxOrderbookPatchUpdate = exports.dydxOrderbookPatchSnapshot = exports.dydxToTradePatchEvent = exports.dydxToInstrumentPatchEvent = void 0;
const core_1 = require("@quantform/core");
const uuid_1 = require("uuid");
const dydx_adapter_1 = require("./dydx-adapter");
function dydxToInstrumentPatchEvent(response, timestamp) {
    const base = new core_1.Asset(response.baseAsset, dydx_adapter_1.DYDX_ADAPTER_NAME, (0, core_1.d)(response.stepSize).decimalPlaces());
    const quote = new core_1.Asset(response.quoteAsset, dydx_adapter_1.DYDX_ADAPTER_NAME, (0, core_1.d)(response.tickSize).decimalPlaces());
    return new core_1.InstrumentPatchEvent(timestamp, base, quote, (0, core_1.commissionPercentOf)({ maker: (0, core_1.d)(0.1), taker: (0, core_1.d)(0.1) }), response.market);
}
exports.dydxToInstrumentPatchEvent = dydxToInstrumentPatchEvent;
function dydxToTradePatchEvent(message, instrument) {
    const timestamp = new Date(message.createdAt).getTime();
    return new core_1.TradePatchEvent(instrument, (0, core_1.d)(message.price), (0, core_1.d)(message.size), timestamp);
}
exports.dydxToTradePatchEvent = dydxToTradePatchEvent;
function dydxOrderbookPatchSnapshot(liquidity, message) {
    const rate = (0, core_1.d)(message.price);
    const quantity = (0, core_1.d)(message.size);
    const offset = parseInt(message.offset);
    if (quantity.greaterThan(core_1.d.Zero)) {
        liquidity.enqueue({ rate, quantity, offset });
    }
    else {
        liquidity.dequeue({ rate, quantity, offset });
    }
}
exports.dydxOrderbookPatchSnapshot = dydxOrderbookPatchSnapshot;
function dydxOrderbookPatchUpdate(liquidity, message, offset) {
    const rate = (0, core_1.d)(message[0]);
    const quantity = (0, core_1.d)(message[1]);
    const current = liquidity.getByKey(rate.toString());
    if (current && current.offset > offset) {
        return;
    }
    liquidity.enqueue({ rate, quantity, offset });
}
exports.dydxOrderbookPatchUpdate = dydxOrderbookPatchUpdate;
function dydxToOrderbookPatchEvent(instrument, asks, bids, timestamp) {
    let ask = asks.head;
    let bid = bids.head;
    asks.visit(it => {
        if (it.quantity.greaterThan(0)) {
            ask = it;
            return false;
        }
        return true;
    });
    bids.visit(it => {
        if (it.quantity.greaterThan(0)) {
            bid = it;
            return false;
        }
        return true;
    });
    if (!ask || !bid) {
        throw new Error('Orderbook error');
    }
    return new core_1.OrderbookPatchEvent(instrument, ask, bid, timestamp);
}
exports.dydxToOrderbookPatchEvent = dydxToOrderbookPatchEvent;
function dydxToBalanceSnapshotPatchEvent(asset, message, timestamp) {
    const free = (0, core_1.d)(message.contents.account.quoteBalance);
    return new core_1.BalancePatchEvent(asset, free, core_1.d.Zero, timestamp);
}
exports.dydxToBalanceSnapshotPatchEvent = dydxToBalanceSnapshotPatchEvent;
function dydxToOrderLoadEvent(message, instruments, timestamp) {
    if (message.type != 'LIMIT') {
        throw new Error(`Unsupported order type ${message.type}`);
    }
    const instrument = instruments.find(it => it.base.adapterName == dydx_adapter_1.DYDX_ADAPTER_NAME && it.raw == message.market);
    if (!instrument) {
        throw new Error('Missing instrument');
    }
    const order = new core_1.Order(timestamp, (0, uuid_1.v4)(), instrument, (0, core_1.d)(message.size), new Date(message.createdAt).getTime(), (0, core_1.d)(message.price));
    order.quantityExecuted = (0, core_1.d)(message.size).minus((0, core_1.d)(message.remainingSize));
    order.externalId = message.id;
    order.state = 'PENDING';
    return new core_1.OrderLoadEvent(order, timestamp);
}
exports.dydxToOrderLoadEvent = dydxToOrderLoadEvent;
