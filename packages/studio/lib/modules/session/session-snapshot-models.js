"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPositionSnapshot = exports.getOrderSnapshot = exports.getBalanceSnapshot = void 0;
function getBalanceSnapshot(balance) {
    return {
        key: balance.asset.id,
        asset: balance.asset.name,
        adapter: balance.asset.adapterName,
        free: balance.free.toFixed(balance.asset.scale),
        locked: balance.locked.toFixed(balance.asset.scale),
        scale: balance.asset.scale,
        kind: balance.kind,
        timestamp: balance.timestamp
    };
}
exports.getBalanceSnapshot = getBalanceSnapshot;
function getOrderSnapshot(order) {
    var _a, _b;
    return __assign(__assign({}, order), { key: order.id, instrument: order.instrument.id, state: order.state.toString(), quantity: order.quantity.toString(), quantityExecuted: order.quantity.toString(), rate: (_a = order.rate) === null || _a === void 0 ? void 0 : _a.toString(), averageExecutionRate: (_b = order.averageExecutionRate) === null || _b === void 0 ? void 0 : _b.toString(), isBuy: order.quantity.greaterThan(0) });
}
exports.getOrderSnapshot = getOrderSnapshot;
function getPositionSnapshot(position) {
    var _a;
    return __assign(__assign({}, position), { key: position.id, instrument: position.instrument.id, size: position.size.toString(), averageExecutionRate: position.averageExecutionRate.toString(), estimatedUnrealizedPnL: (_a = position.estimatedUnrealizedPnL) === null || _a === void 0 ? void 0 : _a.toString() });
}
exports.getPositionSnapshot = getPositionSnapshot;
