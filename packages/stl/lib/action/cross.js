"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossOver = exports.crossUnder = void 0;
const rxjs_1 = require("rxjs");
function crossUnder(trigger, value) {
    return function (source) {
        let triggered = false;
        return source.pipe((0, rxjs_1.filter)(it => {
            const limit = typeof trigger == 'function' ? trigger(it) : trigger;
            const current = value(it);
            if (current.lessThan(limit)) {
                triggered = true;
            }
            if (triggered && current.greaterThan(limit)) {
                triggered = false;
                return true;
            }
            return false;
        }));
    };
}
exports.crossUnder = crossUnder;
function crossOver(trigger, value) {
    return function (source) {
        let triggered = false;
        return source.pipe((0, rxjs_1.filter)(it => {
            const limit = typeof trigger == 'function' ? trigger(it) : trigger;
            const current = value(it);
            if (current.greaterThan(limit)) {
                triggered = true;
            }
            if (triggered && current.lessThan(limit)) {
                triggered = false;
                return true;
            }
            return false;
        }));
    };
}
exports.crossOver = crossOver;
