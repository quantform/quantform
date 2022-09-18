"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wma = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
const window_1 = require("./window");
function wma(length, fn) {
    return function (source) {
        return source.pipe((0, window_1.window)(length, fn), (0, rxjs_1.filter)(([, buffer]) => buffer.isFull), (0, rxjs_1.map)(([it, buffer]) => {
            let norm = (0, core_1.d)(0.0);
            let sum = (0, core_1.d)(0.0);
            for (let i = 0; i < buffer.capacity; i++) {
                const weight = (buffer.capacity - i) * buffer.capacity;
                norm = norm.add(weight);
                sum = sum.add(buffer.at(buffer.capacity - (i + 1)).mul(weight));
            }
            const tuple = [it, sum.div(norm)];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.wma = wma;
