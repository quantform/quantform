"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donchian = void 0;
const rxjs_1 = require("rxjs");
const min_max_1 = require("./min-max");
function donchian(length, fn) {
    return function (source) {
        source = source.pipe((0, rxjs_1.share)());
        return source.pipe((0, rxjs_1.withLatestFrom)(source.pipe((0, min_max_1.minMax)(length, it => fn(it).low)), source.pipe((0, min_max_1.minMax)(length, it => fn(it).high))), (0, rxjs_1.map)(([it, low, high]) => {
            const tuple = [it, { lower: low[1].min, upper: high[1].max }];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.donchian = donchian;
