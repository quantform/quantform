"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.histogram = exports.bar = exports.area = exports.candlestick = exports.linear = exports.marker = exports.pane = exports.layout = void 0;
var uuid_1 = require("uuid");
function layout(layout) {
    return { layout: layout };
}
exports.layout = layout;
function pane(pane) {
    return pane;
}
exports.pane = pane;
function marker(layer) {
    return __assign({ type: 'marker' }, layer);
}
exports.marker = marker;
function linear(layer) {
    var _a;
    return __assign({ key: (_a = layer.key) !== null && _a !== void 0 ? _a : generateKey(), type: 'linear' }, layer);
}
exports.linear = linear;
function candlestick(layer) {
    var _a;
    return __assign({ key: (_a = layer.key) !== null && _a !== void 0 ? _a : generateKey(), type: 'candlestick', borderUpColor: layer.upColor, borderDownColor: layer.downColor, wickUpColor: layer.upColor, wickDownColor: layer.downColor }, layer);
}
exports.candlestick = candlestick;
function area(layer) {
    var _a;
    return __assign({ key: (_a = layer.key) !== null && _a !== void 0 ? _a : generateKey(), type: 'area' }, layer);
}
exports.area = area;
function bar(layer) {
    var _a;
    return __assign({ key: (_a = layer.key) !== null && _a !== void 0 ? _a : generateKey(), type: 'bar' }, layer);
}
exports.bar = bar;
function histogram(layer) {
    var _a;
    return __assign({ key: (_a = layer.key) !== null && _a !== void 0 ? _a : generateKey(), type: 'histogram' }, layer);
}
exports.histogram = histogram;
function generateKey() {
    return (0, uuid_1.v4)().replace(/-/g, '');
}
