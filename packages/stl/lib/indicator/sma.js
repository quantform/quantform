"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sma = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
const window_1 = require("./window");
function sma(length, fn) {
    return function (source) {
        let accumulated = core_1.d.Zero;
        return source.pipe((0, window_1.window)(length, fn), (0, rxjs_1.tap)(([, , added, removed]) => (accumulated = accumulated.add(added).minus(removed !== null && removed !== void 0 ? removed : 0))), (0, rxjs_1.filter)(([, buffer]) => buffer.isFull), (0, rxjs_1.map)(([it, buffer]) => {
            const tuple = [it, accumulated.div(buffer.size)];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.sma = sma;
