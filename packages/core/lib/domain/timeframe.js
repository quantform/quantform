"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tf = exports.Timeframe = void 0;
class Timeframe {
}
exports.Timeframe = Timeframe;
Timeframe.S1 = 1000;
Timeframe.M1 = Timeframe.S1 * 60;
Timeframe.M5 = Timeframe.M1 * 5;
Timeframe.M15 = Timeframe.M5 * 3;
Timeframe.M30 = Timeframe.M15 * 2;
Timeframe.H1 = Timeframe.M30 * 2;
Timeframe.H4 = Timeframe.H1 * 4;
Timeframe.H6 = Timeframe.H1 * 6;
Timeframe.H12 = Timeframe.H6 * 2;
Timeframe.D1 = Timeframe.H12 * 2;
Timeframe.W1 = Timeframe.D1 * 7;
function tf(timestamp, timeframe) {
    return timestamp - (timestamp % timeframe);
}
exports.tf = tf;
