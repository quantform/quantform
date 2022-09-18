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
exports.Accordion = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var charting_theme_context_1 = require("../../charting/charting-theme-context");
function Accordion(_a) {
    var children = _a.children, title = _a.title, className = _a.className;
    var _b = (0, react_1.useState)(true), expanded = _b[0], setExpanded = _b[1];
    var theme = (0, charting_theme_context_1.useChartingThemeContext)().theme;
    var chevronDown = ((0, jsx_runtime_1.jsx)("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, { children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z", clipRule: "evenodd" }) })));
    var chevronUp = ((0, jsx_runtime_1.jsx)("svg", __assign({ xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, { children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" }) })));
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "".concat(expanded ? 'flex-1' : '', " overflow-y-auto flex flex-col w-96 text-xs font-mono border-zinc-700 border-b-2") }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "p-3 pb-2 flex opacity-50 cursor-pointer", onClick: function () { return setExpanded(!expanded); } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: "grow" }, { children: title.toUpperCase() })), (0, jsx_runtime_1.jsx)("div", { children: expanded ? chevronDown : chevronUp })] })), expanded && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "border-zinc-700 border-t overflow-y-scroll grow", style: {
                    background: "linear-gradient(".concat(theme.backgroundTopColor, ", ").concat(theme.backgroundBottomColor, ")")
                } }, { children: children })))] })));
}
exports.Accordion = Accordion;
