"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trueRange = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
function trueRange(fn) {
    return function (source) {
        let previous;
        return source.pipe((0, rxjs_1.map)(it => {
            const current = fn(it);
            const value = previous == null
                ? current.high.minus(current.low)
                : core_1.decimal.max(core_1.decimal.max(current.high.minus(current.low), core_1.decimal.abs(current.high.minus(previous.close))), core_1.decimal.abs(current.low.minus(previous.close)));
            const tuple = [it, value];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.trueRange = trueRange;
