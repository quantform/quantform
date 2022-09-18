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
exports.SidePanel = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var session_snapshot_context_1 = require("../session-snapshot-context");
var balance_list_1 = require("./balance-list");
var order_list_1 = require("./order-list");
var position_list_1 = require("./position-list");
var side_panel_accordion_1 = require("./side-panel-accordion");
function SidePanel() {
    var _a = (0, session_snapshot_context_1.useSessionSnapshotContext)(), balance = _a.balance, orders = _a.orders, positions = _a.positions;
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex flex-col grow overflow-x-scroll" }, { children: [(0, jsx_runtime_1.jsx)(side_panel_accordion_1.Accordion, __assign({ title: "Funds" }, { children: (0, jsx_runtime_1.jsx)(balance_list_1.BalanceList, { balances: Object.values(balance).sort(function (lhs, rhs) { return rhs.timestamp - lhs.timestamp; }) }) })), (0, jsx_runtime_1.jsx)(side_panel_accordion_1.Accordion, __assign({ title: "Orders" }, { children: (0, jsx_runtime_1.jsx)(order_list_1.OrderList, { orders: Object.values(orders).sort(function (lhs, rhs) { return rhs.timestamp - lhs.timestamp; }) }) })), (0, jsx_runtime_1.jsx)(side_panel_accordion_1.Accordion, __assign({ title: "Positions" }, { children: (0, jsx_runtime_1.jsx)(position_list_1.PositionList, { positions: Object.values(positions).sort(function (lhs, rhs) { return rhs.timestamp - lhs.timestamp; }) }) }))] })));
}
exports.SidePanel = SidePanel;
