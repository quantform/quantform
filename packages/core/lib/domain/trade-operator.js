"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trade = void 0;
const rxjs_1 = require("rxjs");
const trade_1 = require("./trade");
function trade(selector, state) {
    return (source$) => source$.pipe((0, rxjs_1.startWith)(state.trade.get(selector.id)), (0, rxjs_1.filter)(it => it instanceof trade_1.Trade && it.instrument.id == selector.id), (0, rxjs_1.map)(it => it));
}
exports.trade = trade;
