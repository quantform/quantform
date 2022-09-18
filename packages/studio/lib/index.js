"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.study = void 0;
var rxjs_1 = require("rxjs");
var services_1 = require("./services");
__exportStar(require("./services"), exports);
function study(port, delegate) {
    return function (session) {
        return (0, rxjs_1.from)((0, services_1.createServerSession)(port, session)).pipe((0, rxjs_1.switchMap)(function () { return (0, rxjs_1.defer)(function () { return delegate(session); }); }));
    };
}
exports.study = study;
