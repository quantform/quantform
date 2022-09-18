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
exports.ChartingThemeProvider = exports.useChartingThemeContext = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var ChartingThemeContext = (0, react_1.createContext)({
    theme: { children: [] },
    setTheme: function (theme) { }
});
var useChartingThemeContext = function () {
    return (0, react_1.useContext)(ChartingThemeContext);
};
exports.useChartingThemeContext = useChartingThemeContext;
var ChartingThemeProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)({
        children: []
    }), theme = _b[0], setTheme = _b[1];
    var value = {
        theme: theme,
        setTheme: setTheme
    };
    return ((0, jsx_runtime_1.jsx)(ChartingThemeContext.Provider, __assign({ value: value }, { children: children })));
};
exports.ChartingThemeProvider = ChartingThemeProvider;
