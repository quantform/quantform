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
exports.BalanceList = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
function formatTimestamp(timestamp) {
    var date = new Date(timestamp);
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
function BalanceList(_a) {
    var balances = _a.balances;
    return ((0, jsx_runtime_1.jsx)("div", __assign({ className: "flex flex-col text-tiny font-mono w-full h-full whitespace-nowrap text-slate-100" }, { children: (0, jsx_runtime_1.jsx)("table", __assign({ className: "table-auto leading-4 w-full text-left" }, { children: (0, jsx_runtime_1.jsx)("tbody", { children: balances.map(function (balance) { return ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("tr", __assign({ className: "border-zinc-700 border-t first:border-t-0" }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pt-3" }, { children: balance.key.toUpperCase() })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pt-3 text-right" }, { children: balance.free }))] })), (0, jsx_runtime_1.jsxs)("tr", __assign({ className: "opacity-50" }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pb-3" }, { children: formatTimestamp(balance.timestamp) })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pb-3 text-right" }, { children: balance.locked }))] }))] }, balance.key)); }) }) })) })));
}
exports.BalanceList = BalanceList;
