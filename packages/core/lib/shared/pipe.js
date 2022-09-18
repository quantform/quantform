"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ofType = void 0;
const rxjs_1 = require("rxjs");
function ofType(type) {
    return (input) => input.pipe((0, rxjs_1.filter)(it => it instanceof type), (0, rxjs_1.map)(it => it));
}
exports.ofType = ofType;
