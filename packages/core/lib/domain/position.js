"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
const shared_1 = require("../shared");
class Position {
    constructor(timestamp, id, instrument, mode, averageExecutionRate, size, leverage) {
        this.timestamp = timestamp;
        this.id = id;
        this.instrument = instrument;
        this.mode = mode;
        this.averageExecutionRate = averageExecutionRate;
        this.size = size;
        this.leverage = leverage;
        this.kind = 'position';
    }
    get margin() {
        return this.instrument.quote.floor(this.size.abs().div(this.leverage));
    }
    calculateEstimatedUnrealizedPnL(rate) {
        this.estimatedUnrealizedPnL = this.instrument.quote.floor((0, shared_1.pnl)(this.averageExecutionRate, rate, this.size));
        return this.estimatedUnrealizedPnL;
    }
    toString() {
        return this.id;
    }
}
exports.Position = Position;
