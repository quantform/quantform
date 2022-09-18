"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacktesterStreamer = void 0;
const backtester_cursor_1 = require("./backtester-cursor");
const error_1 = require("./error");
class BacktesterStreamer {
    constructor(store, feed, period, listener) {
        this.store = store;
        this.feed = feed;
        this.period = period;
        this.listener = listener;
        this.sequenceUpdateBatch = 10000;
        this.cursor = {};
        this.stopAcquire = 1;
        this.sequence = 0;
        if (period.from == undefined || period.to == undefined) {
            throw (0, error_1.missingPeriodParametersError)();
        }
        this.timestamp = period.from;
    }
    getTimeProvider() {
        const provider = {
            timestamp: () => this.timestamp
        };
        return provider;
    }
    subscribe(instrument) {
        if (instrument.id in this.cursor) {
            return;
        }
        const cursor = new backtester_cursor_1.BacktesterCursor(instrument, this.feed);
        this.cursor[instrument.id] = cursor;
    }
    /**
     * Increments stop counter.
     */
    stop() {
        this.stopAcquire++;
    }
    /**
     * Decreases stop counter and continues execution if no more stops requested.
     */
    tryContinue() {
        var _a;
        if (this.stopAcquire == 0) {
            return;
        }
        this.stopAcquire = Math.max(0, this.stopAcquire - 1);
        if (this.stopAcquire != 0) {
            return;
        }
        if (this.sequence == 0) {
            if ((_a = this.listener) === null || _a === void 0 ? void 0 : _a.onBacktestStarted) {
                this.listener.onBacktestStarted(this);
            }
        }
        const next = () => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            if (yield this.processNext()) {
                if (this.sequence % this.sequenceUpdateBatch == 0) {
                    if ((_b = this.listener) === null || _b === void 0 ? void 0 : _b.onBacktestUpdated) {
                        this.listener.onBacktestUpdated(this);
                    }
                }
                if (this.stopAcquire === 0) {
                    setImmediate(next);
                }
            }
            else {
                if ((_c = this.listener) === null || _c === void 0 ? void 0 : _c.onBacktestCompleted) {
                    this.listener.onBacktestCompleted(this);
                }
            }
        });
        next();
    }
    processNext() {
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = yield this.current(this.timestamp, this.period.to);
            if (!cursor) {
                return false;
            }
            const event = cursor.peek();
            if (!event) {
                return false;
            }
            this.timestamp = event.timestamp;
            this.sequence++;
            this.store.dispatch(event);
            if (cursor.dequeue().timestamp != event.timestamp) {
                throw (0, error_1.invalidEventSequenceError)();
            }
            return true;
        });
    }
    current(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cursor of Object.values(this.cursor)) {
                if (cursor.size == 0 && !cursor.completed) {
                    yield cursor.fetchNextPage(from, to);
                }
            }
            return Object.values(this.cursor)
                .filter(it => it !== undefined)
                .sort((lhs, rhs) => { var _a, _b, _c, _d; return ((_b = (_a = lhs === null || lhs === void 0 ? void 0 : lhs.peek()) === null || _a === void 0 ? void 0 : _a.timestamp) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = rhs === null || rhs === void 0 ? void 0 : rhs.peek()) === null || _c === void 0 ? void 0 : _c.timestamp) !== null && _d !== void 0 ? _d : 0); })
                .find(() => true);
        });
    }
}
exports.BacktesterStreamer = BacktesterStreamer;
