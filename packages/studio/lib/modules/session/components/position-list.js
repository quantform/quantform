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
exports.PositionList = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
function PositionList(_a) {
    var positions = _a.positions;
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex flex-col whitespace-nowrap font-mono w-full h-full text-tiny text-slate-100" }, { children: [(0, jsx_runtime_1.jsx)("table", __assign({ className: "table-auto leading-7 w-full text-left" }, { children: (0, jsx_runtime_1.jsx)("tbody", { children: positions.map(function (position) { return ((0, jsx_runtime_1.jsxs)("tr", __assign({ className: "text-white border-zinc-700 border-t first:border-t-0" }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.instrument.toUpperCase() })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.size })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.averageExecutionRate })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.leverage })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.mode })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-4" }, { children: position.estimatedUnrealizedPnL }))] }), position.key)); }) }) })), !positions.length && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "flex grow justify-center items-center w-full h-full" }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: "grow opacity-30 uppercase text-center p-4" }, { children: "No open positions" })) })))] })));
}
exports.PositionList = PositionList;
