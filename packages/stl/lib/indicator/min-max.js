"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minMax = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
const window_1 = require("./window");
function minMax(length, fn) {
    return function (source) {
        return source.pipe((0, window_1.window)(length, fn), (0, rxjs_1.filter)(([, buffer]) => buffer.isFull), (0, rxjs_1.map)(([it, buffer]) => {
            let min = core_1.d.Zero;
            let max = core_1.d.Zero;
            buffer.forEach(it => {
                min = core_1.decimal.min(it, min);
                max = core_1.decimal.max(it, max);
            });
            const tuple = [it, { min, max }];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.minMax = minMax;
