"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balance = void 0;
const rxjs_1 = require("rxjs");
const balance_1 = require("./balance");
function balance(selector, state) {
    return (source$) => source$.pipe((0, rxjs_1.startWith)(state.balance.get(selector.id)), (0, rxjs_1.filter)(it => it instanceof balance_1.Balance && (!selector || it.asset.id == selector.id)), (0, rxjs_1.map)(it => it));
}
exports.balance = balance;
