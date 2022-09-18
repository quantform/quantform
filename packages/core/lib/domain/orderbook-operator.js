"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderbook = void 0;
const rxjs_1 = require("rxjs");
const orderbook_1 = require("./orderbook");
function orderbook(selector, state) {
    return (source$) => source$.pipe((0, rxjs_1.startWith)(state.orderbook.get(selector.id)), (0, rxjs_1.filter)(it => it instanceof orderbook_1.Orderbook && it.instrument.id == selector.id), (0, rxjs_1.map)(it => it));
}
exports.orderbook = orderbook;
