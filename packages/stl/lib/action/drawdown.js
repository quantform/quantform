"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawdown = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
function drawdown(fn) {
    return function (source) {
        let rate;
        let max = core_1.d.Zero;
        return source.pipe((0, rxjs_1.map)(it => {
            const value = fn(it);
            if (!rate) {
                rate = value;
            }
            else {
                if (value > rate) {
                    rate = value;
                }
                else if (value < rate) {
                    max = core_1.decimal.min(max, value.div(rate).minus(1));
                }
            }
            return max;
        }), (0, rxjs_1.share)());
    };
}
exports.drawdown = drawdown;
