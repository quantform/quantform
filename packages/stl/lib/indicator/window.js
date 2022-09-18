"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.window = void 0;
const rxjs_1 = require("rxjs");
const ring_buffer_1 = require("./ring-buffer");
function window(length, fn) {
    return function (source) {
        const buffer = new ring_buffer_1.RingBuffer(length);
        return source.pipe((0, rxjs_1.map)(it => {
            let removed = undefined;
            if (buffer.isFull) {
                removed = buffer.peek();
            }
            const value = fn(it);
            buffer.enqueue(value);
            const tuple = [it, buffer, value, removed];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.window = window;
