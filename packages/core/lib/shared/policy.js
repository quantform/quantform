"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
const ts_retry_1 = require("ts-retry");
function retry(fn) {
    return (0, ts_retry_1.retryAsync)(fn, { delay: 1000, maxTry: 3 });
}
exports.retry = retry;
