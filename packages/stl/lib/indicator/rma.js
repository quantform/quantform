"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rma = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
const _1 = require(".");
function rma(length, fn) {
    return function (source) {
        const alpha = (0, core_1.d)(1.0).div(length);
        let value;
        return source.pipe((0, _1.sma)(length, fn), (0, rxjs_1.map)(([it, sma]) => {
            if (!value) {
                value = sma;
            }
            else {
                value = alpha.mul(fn(it)).plus((0, core_1.d)(1.0).minus(alpha).mul(value));
            }
            const tuple = [it, value];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.rma = rma;
