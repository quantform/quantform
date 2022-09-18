"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orders = exports.order = void 0;
const rxjs_1 = require("rxjs");
const order_1 = require("./order");
function order(selector) {
    return (source$) => source$.pipe((0, rxjs_1.filter)(it => it instanceof order_1.Order && it.instrument.id == selector.id), (0, rxjs_1.map)(it => it));
}
exports.order = order;
function orders(selector, state) {
    return (source$) => {
        var _a, _b;
        return source$.pipe((0, rxjs_1.filter)(it => it instanceof order_1.Order && it.instrument.id == selector.id), (0, rxjs_1.map)(() => { var _a, _b; return (_b = (_a = state.order.get(selector.id)) === null || _a === void 0 ? void 0 : _a.asReadonlyArray()) !== null && _b !== void 0 ? _b : []; }), (0, rxjs_1.startWith)((_b = (_a = state.order.get(selector.id)) === null || _a === void 0 ? void 0 : _a.asReadonlyArray()) !== null && _b !== void 0 ? _b : []));
    };
}
exports.orders = orders;
