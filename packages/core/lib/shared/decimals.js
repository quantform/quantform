"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candleup = exports.candledown = exports.pnl = exports.weightedMean = exports.d = exports.decimal = void 0;
const decimal_js_1 = require("decimal.js");
decimal_js_1.Decimal.prototype.toFloor = function (decimalPlaces) {
    return this.toDecimalPlaces(decimalPlaces, decimal_js_1.Decimal.ROUND_FLOOR);
};
decimal_js_1.Decimal.prototype.toCeil = function (decimalPlaces) {
    return this.toDecimalPlaces(decimalPlaces, decimal_js_1.Decimal.ROUND_CEIL);
};
class decimal extends decimal_js_1.Decimal {
}
exports.decimal = decimal;
function d(value) {
    return new decimal(value);
}
exports.d = d;
d.Zero = new decimal(0);
function weightedMean(values, weights) {
    const result = values
        .map((value, i) => {
        const weight = weights[i];
        const sum = value.mul(weight);
        return [sum, weight];
    })
        .reduce((p, c) => [p[0].add(c[0]), p[1].add(c[1])], [d.Zero, d.Zero]);
    if (!result[1]) {
        return d.Zero;
    }
    return result[0].div(result[1]);
}
exports.weightedMean = weightedMean;
function pnl(entryRate, exitRate, amount) {
    return exitRate.div(entryRate).minus(1).mul(amount);
}
exports.pnl = pnl;
/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
function candledown(timestamp, timeframe) {
    return timestamp - (timestamp % timeframe);
}
exports.candledown = candledown;
/**
 *
 * @param timestamp
 * @param timeframe
 * @returns nearest timestamp to the given timeframe
 */
function candleup(timestamp, timeframe) {
    return candledown(timestamp, timeframe) + timeframe;
}
exports.candleup = candleup;
