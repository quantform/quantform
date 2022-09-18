"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tma = void 0;
const rxjs_1 = require("rxjs");
const swma_1 = require("./swma");
const wma_1 = require("./wma");
function tma(length, fn) {
    return function (source) {
        return source.pipe((0, wma_1.wma)(length, fn), (0, swma_1.swma)(([, it]) => it), (0, rxjs_1.map)(([[it], swma]) => {
            const tuple = [it, swma];
            return tuple;
        }), (0, rxjs_1.share)());
    };
}
exports.tma = tma;
