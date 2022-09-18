"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candleCompleted = exports.mergeCandle = exports.candle = void 0;
const rxjs_1 = require("rxjs");
const candle_1 = require("./candle");
const timeframe_1 = require("./timeframe");
function aggregate(candle, timeframe, value, timestamp) {
    const frame = (0, timeframe_1.tf)(timestamp, timeframe);
    if (!candle) {
        return new candle_1.Candle(frame, value, value, value, value);
    }
    if (candle.timestamp === frame) {
        candle.apply(value);
        return undefined;
    }
    else {
        return new candle_1.Candle(frame, candle.close, value, value, value);
    }
}
function candle(timeframe, fn, candleToStartWith) {
    return function (source) {
        let candle = candleToStartWith;
        return source.pipe((0, rxjs_1.map)(it => {
            const newCandle = aggregate(candle, timeframe, fn(it), it.timestamp);
            if (newCandle) {
                const prevCandle = candle;
                candle = newCandle;
                if (candleToStartWith && candleToStartWith.timestamp < newCandle.timestamp) {
                    candleToStartWith = undefined;
                    if (prevCandle) {
                        return [prevCandle, candle];
                    }
                    return [candle];
                }
            }
            if (candleToStartWith) {
                candleToStartWith = undefined;
            }
            if (candle) {
                return [candle];
            }
            return [];
        }), (0, rxjs_1.mergeMap)(it => it), (0, rxjs_1.share)());
    };
}
exports.candle = candle;
function mergeCandle(timeframe, fn, history$) {
    return function (source$) {
        return (0, rxjs_1.concat)(history$.pipe((0, rxjs_1.skipLast)(1)), history$.pipe((0, rxjs_1.last)(), (0, rxjs_1.switchMap)(lastHistoricalCandle => source$.pipe(candle(timeframe, fn, lastHistoricalCandle))), (0, rxjs_1.share)()));
    };
}
exports.mergeCandle = mergeCandle;
function candleCompleted() {
    let currCandle;
    return (source) => source.pipe((0, rxjs_1.map)(it => {
        if (!currCandle) {
            currCandle = it;
            return undefined;
        }
        else {
            if (currCandle.timestamp !== it.timestamp) {
                const prevCandle = currCandle;
                currCandle = it;
                return prevCandle;
            }
            return undefined;
        }
    }), (0, rxjs_1.filter)(it => it !== undefined), (0, rxjs_1.share)());
}
exports.candleCompleted = candleCompleted;
