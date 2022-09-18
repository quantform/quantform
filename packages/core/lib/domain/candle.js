"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Candle = void 0;
const shared_1 = require("../shared");
class Candle {
    constructor(timestamp, open, high, low, close, volume) {
        this.timestamp = timestamp;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
    }
    apply(value) {
        this.high = shared_1.decimal.max(this.high, value);
        this.low = shared_1.decimal.min(this.low, value);
        this.close = value;
    }
}
exports.Candle = Candle;
