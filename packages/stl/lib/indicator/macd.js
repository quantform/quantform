"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.macd = void 0;
const rxjs_1 = require("rxjs");
const ema_1 = require("./ema");
function macd(fast, slow, length, fn) {
    return function (source) {
        source = source.pipe((0, rxjs_1.share)());
        return source.pipe((0, rxjs_1.withLatestFrom)(source.pipe((0, ema_1.ema)(fast, fn)), source.pipe((0, ema_1.ema)(slow, fn))), (0, ema_1.ema)(length, it => it[1][1].minus(it[2][1])), (0, rxjs_1.map)(([, macd]) => macd), (0, rxjs_1.share)());
    };
}
exports.macd = macd;
