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
exports.ChartViewport = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var lightweight_charts_1 = require("lightweight-charts");
function createTradingViewChart(chartContainer, layout) {
    return (0, lightweight_charts_1.createChart)(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        timeScale: {
            timeVisible: true,
            borderColor: layout.borderColor
        },
        rightPriceScale: {
            borderColor: layout.borderColor
        },
        layout: {
            background: {
                type: layout.backgroundTopColor == layout.backgroundBottomColor
                    ? lightweight_charts_1.ColorType.Solid
                    : lightweight_charts_1.ColorType.VerticalGradient,
                color: layout.backgroundTopColor || layout.backgroundBottomColor,
                topColor: layout.backgroundTopColor,
                bottomColor: layout.backgroundBottomColor
            },
            textColor: layout.textColor,
            fontFamily: 'JetBrains Mono'
        },
        grid: {
            horzLines: {
                color: layout.gridColor
            },
            vertLines: {
                color: layout.gridColor
            }
        }
    });
}
function createTradingViewSeries(chart, layout) {
    return layout.children.reduce(function (series, pane, index) {
        var _loop_1 = function (layer) {
            var options = __assign(__assign({}, layer), { priceFormat: {
                    type: 'custom',
                    formatter: function (price) { return parseFloat(price).toFixed(layer.scale); }
                }, pane: index });
            switch (layer.type) {
                case 'linear':
                    series[layer.key] = chart.addLineSeries(options);
                    break;
                case 'area':
                    series[layer.key] = chart.addAreaSeries(options);
                    break;
                case 'candlestick':
                    series[layer.key] = chart.addCandlestickSeries(options);
                    break;
                case 'bar':
                    series[layer.key] = chart.addBarSeries(options);
                    break;
                case 'histogram':
                    series[layer.key] = chart.addHistogramSeries(options);
                    break;
            }
        };
        for (var _i = 0, _a = pane.children; _i < _a.length; _i++) {
            var layer = _a[_i];
            _loop_1(layer);
        }
        return series;
    }, {});
}
var ChartViewport = /** @class */ (function () {
    function ChartViewport(barsBefore, barsAfter, from, to) {
        this.barsBefore = barsBefore;
        this.barsAfter = barsAfter;
        this.from = from;
        this.to = to;
    }
    Object.defineProperty(ChartViewport.prototype, "requiresBackward", {
        get: function () {
            return this.barsBefore && this.barsBefore < 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ChartViewport.prototype, "requiresForward", {
        get: function () {
            return this.barsAfter && this.barsAfter < 0;
        },
        enumerable: false,
        configurable: true
    });
    return ChartViewport;
}());
exports.ChartViewport = ChartViewport;
function ChartingView(props) {
    var chartContainerRef = (0, react_1.useRef)();
    var chart = (0, react_1.useRef)();
    var _a = (0, react_1.useState)({}), chartSeries = _a[0], setSeries = _a[1];
    var resizeObserver = (0, react_1.useRef)();
    (0, react_1.useEffect)(function () {
        var layout = props.layout;
        var newChart = createTradingViewChart(chartContainerRef.current, layout);
        setSeries(createTradingViewSeries(newChart, layout));
        chart.current = newChart;
        return function () { return newChart.remove(); };
    }, []);
    (0, react_1.useEffect)(function () {
        var visibleLogicalRangeHandler = function () {
            var _a;
            var range = (_a = chart.current.timeScale()) === null || _a === void 0 ? void 0 : _a.getVisibleLogicalRange();
            if (!range) {
                return;
            }
            var barsInfo = Object.values(chartSeries)
                .map(function (series) { return series.barsInLogicalRange(range); })
                .filter(function (it) { return it != null; });
            if (!barsInfo) {
                return;
            }
            var viewport = new ChartViewport(Math.max.apply(Math, barsInfo.map(function (it) { return it.barsBefore; })), Math.min.apply(Math, barsInfo.map(function (it) { return it.barsAfter; })), Math.min.apply(Math, barsInfo.map(function (it) { return it.from; })), Math.max.apply(Math, barsInfo.map(function (it) { return it.to; })));
            if (props.viewportChanged) {
                props.viewportChanged(viewport);
            }
        };
        chart
            .current.timeScale()
            .subscribeVisibleLogicalRangeChange(visibleLogicalRangeHandler);
        return function () {
            return chart
                .current.timeScale()
                .unsubscribeVisibleLogicalRangeChange(visibleLogicalRangeHandler);
        };
    }, [chart, chartSeries]);
    (0, react_1.useEffect)(function () {
        var patched = Object.keys(props.measurement.patched);
        if (patched.length > 0) {
            patched.forEach(function (key) {
                var series = chartSeries[key];
                props.measurement.patched[key].series.forEach(function (it) { return series.update(it); });
                if (props.measurement.patched[key].markers.length) {
                    series.setMarkers(props.measurement.snapshot[key].markers);
                }
            });
        }
        else {
            Object.keys(props.measurement.snapshot).forEach(function (key) {
                var measurement = props.measurement.snapshot[key];
                var series = chartSeries[key];
                series.setData(measurement.series);
                series.setMarkers(measurement.markers);
            });
        }
    }, [props.measurement, chartSeries]);
    (0, react_1.useEffect)(function () {
        resizeObserver.current = new ResizeObserver(function () {
            chart.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
        });
        resizeObserver.current.observe(chartContainerRef.current);
        return function () { return resizeObserver.current.disconnect(); };
    }, []);
    return (0, jsx_runtime_1.jsx)("div", { className: " h-full", ref: chartContainerRef });
}
exports.default = ChartingView;
