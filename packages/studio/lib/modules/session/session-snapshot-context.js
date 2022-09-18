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
exports.SessionSnapshotProvider = exports.useSessionSnapshotContext = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var SessionSnapshotContext = (0, react_1.createContext)({
    balance: {},
    orders: {},
    positions: {},
    dispatch: function () { }
});
var useSessionSnapshotContext = function () {
    return (0, react_1.useContext)(SessionSnapshotContext);
};
exports.useSessionSnapshotContext = useSessionSnapshotContext;
var reduceSessionSnapshot = function (state, action) {
    var _a, _b, _c, _d, _e, _f;
    switch (action.type) {
        case 'snapshot':
            return {
                balance: (_a = action.balance) !== null && _a !== void 0 ? _a : {},
                orders: (_b = action.orders) !== null && _b !== void 0 ? _b : {},
                positions: (_c = action.positions) !== null && _c !== void 0 ? _c : {}
            };
        case 'patch':
            return {
                balance: __assign(__assign({}, state.balance), ((_d = action.balance) !== null && _d !== void 0 ? _d : {})),
                orders: __assign(__assign({}, state.orders), ((_e = action.orders) !== null && _e !== void 0 ? _e : {})),
                positions: __assign(__assign({}, state.positions), ((_f = action.positions) !== null && _f !== void 0 ? _f : {}))
            };
    }
};
var SessionSnapshotProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useReducer)(reduceSessionSnapshot, {
        balance: {},
        orders: {},
        positions: {}
    }), snapshot = _b[0], dispatch = _b[1];
    var value = __assign(__assign({}, snapshot), { dispatch: dispatch });
    return ((0, jsx_runtime_1.jsx)(SessionSnapshotContext.Provider, __assign({ value: value }, { children: children })));
};
exports.SessionSnapshotProvider = SessionSnapshotProvider;
