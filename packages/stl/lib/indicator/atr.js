"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atr = void 0;
const rxjs_1 = require("rxjs");
const rma_1 = require("./rma");
const true_range_1 = require("./true-range");
function atr(length, fn) {
    return function (source) {
        return source.pipe((0, true_range_1.trueRange)(fn), (0, rma_1.rma)(length, ([, tr]) => tr), (0, rxjs_1.map)(([[it], tr]) => {
            const tuple = [it, tr];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.atr = atr;
