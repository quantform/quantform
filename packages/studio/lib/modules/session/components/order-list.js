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
exports.OrderList = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var charting_theme_context_1 = require("../../charting/charting-theme-context");
function formatTimestamp(timestamp) {
    var date = new Date(timestamp);
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
function OrderList(_a) {
    var orders = _a.orders;
    var theme = (0, charting_theme_context_1.useChartingThemeContext)().theme;
    var tint = function (order) { var _a; return (_a = (order.isBuy ? theme.upColor : theme.downColor)) !== null && _a !== void 0 ? _a : '#000000'; };
    var dimmed = function (order) {
        return order.state != 'NEW' && order.state != 'PENDING';
    };
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex flex-col whitespace-nowrap font-mono w-full h-full  text-tiny text-slate-100" }, { children: [(0, jsx_runtime_1.jsx)("table", __assign({ className: "table-auto leading-4 w-full text-left" }, { children: (0, jsx_runtime_1.jsx)("tbody", { children: orders.map(function (order) {
                        var _a, _b;
                        return ((0, jsx_runtime_1.jsxs)(react_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("tr", __assign({ className: "border-zinc-700 border-t first:border-t-0 ".concat(dimmed(order) ? 'opacity-50' : 'opacity-100') }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pt-3 border-l-4", style: { borderColor: tint(order) } }, { children: order.instrument.toUpperCase() })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pt-3" }, { children: (_b = (_a = order.averageExecutionRate) !== null && _a !== void 0 ? _a : order.rate) !== null && _b !== void 0 ? _b : '' })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pt-3 text-right" }, { children: order.quantity }))] })), (0, jsx_runtime_1.jsxs)("tr", __assign({ className: "opacity-50" }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pb-3 border-l-4", style: { borderColor: tint(order) } }, { children: formatTimestamp(order.timestamp) })), (0, jsx_runtime_1.jsxs)("td", __assign({ className: "px-3 pb-3" }, { children: [order.state, " ", order.type] })), (0, jsx_runtime_1.jsx)("td", __assign({ className: "px-3 pb-3 text-right" }, { children: order.quantityExecuted }))] }))] }, order.key));
                    }) }) })), !orders.length && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "flex grow justify-center items-center w-full h-full" }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: "grow opacity-30 uppercase text-center p-4" }, { children: "No orders" })) })))] })));
}
exports.OrderList = OrderList;
