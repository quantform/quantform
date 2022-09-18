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
exports.SessionState = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var charting_theme_context_1 = require("../../charting/charting-theme-context");
function SessionState() {
    var theme = (0, charting_theme_context_1.useChartingThemeContext)().theme;
    var logo = ((0, jsx_runtime_1.jsxs)("svg", __assign({ width: "16", height: "16", viewBox: "0 0 512 512", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, { children: [(0, jsx_runtime_1.jsx)("path", { d: "M491 416.625C491 446.103 467.037 470 437.477 470C407.918 470 383.955 446.103 383.955 416.625C383.955 387.147 407.918 363.25 437.477 363.25C467.037 363.25 491 387.147 491 416.625Z", fill: "#888" }), (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M342.001 440.936C310.317 459.412 273.444 470 234.091 470C115.852 470 20 374.413 20 256.5C20 138.587 115.852 43 234.091 43C352.33 43 448.182 138.587 448.182 256.5C448.182 278.982 444.697 300.653 438.237 321.005C383.78 326.008 341.136 371.688 341.136 427.3C341.136 431.92 341.431 436.471 342.001 440.936ZM362.545 256.5C362.545 327.248 305.034 384.6 234.091 384.6C163.147 384.6 105.636 327.248 105.636 256.5C105.636 185.752 163.147 128.4 234.091 128.4C305.034 128.4 362.545 185.752 362.545 256.5Z", fill: "#888" })] })));
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex items-center p-2", style: {
            background: "linear-gradient(".concat(theme.backgroundTopColor, ", ").concat(theme.backgroundBottomColor, ")")
        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "mr-1" }, { children: [logo, " "] })), (0, jsx_runtime_1.jsx)("div", __assign({ className: "text-right font-mono text-xs text-slate-100 opacity-50" }, { children: "Connected" }))] })));
}
exports.SessionState = SessionState;
