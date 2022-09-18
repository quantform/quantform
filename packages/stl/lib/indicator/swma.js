"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swma = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
const window_1 = require("./window");
function swma(fn) {
    return function (source) {
        return source.pipe((0, window_1.window)(4, fn), (0, rxjs_1.filter)(([, buffer]) => buffer.isFull), (0, rxjs_1.map)(([it, buffer]) => {
            const x3 = buffer.at(buffer.capacity - (3 + 1));
            const x2 = buffer.at(buffer.capacity - (2 + 1));
            const x1 = buffer.at(buffer.capacity - (1 + 1));
            const x0 = buffer.at(buffer.capacity - (0 + 1));
            const value = core_1.d.Zero.plus(x3.mul(1).div(6))
                .plus(x2.mul(2).div(6))
                .plus(x1.mul(2).div(6))
                .plus(x0.mul(1).div(6));
            const tuple = [it, value];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.swma = swma;
