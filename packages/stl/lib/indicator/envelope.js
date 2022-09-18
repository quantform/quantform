"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envelope = void 0;
const rxjs_1 = require("rxjs");
const sma_1 = require("./sma");
function envelope(length, percent, valueFn) {
    return function (source) {
        return source.pipe((0, sma_1.sma)(length, valueFn), (0, rxjs_1.map)(([, sma]) => {
            const offset = sma.mul(percent).div(100);
            return {
                min: sma.minus(offset),
                max: sma.add(offset)
            };
        }), (0, rxjs_1.share)());
    };
}
exports.envelope = envelope;
