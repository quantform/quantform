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
exports.transformHistogramLayer = exports.transformBarLayer = exports.transformAreaLayer = exports.transformCandlestickLayer = exports.transformLinearLayer = exports.transformLayer = exports.transformLayout = exports.appendLayoutProps = void 0;
function appendLayoutProps(layout, patch) {
    var result = __assign({}, layout);
    Object.keys(patch).reduce(function (acc, key) {
        for (var _i = 0, _a = patch[key].series; _i < _a.length; _i++) {
            var props = _a[_i];
            if (!acc[key]) {
                acc[key] = { series: [props], markers: [] };
            }
            else {
                var target = acc[key].series;
                if (target[target.length - 1].time == props.time) {
                    target[target.length - 1] = props;
                }
                if (target[target.length - 1].time < props.time) {
                    target.push(props);
                }
            }
        }
        for (var _b = 0, _c = patch[key].markers; _b < _c.length; _b++) {
            var marker = _c[_b];
            if (!acc[key]) {
                acc[key] = { series: [], markers: [marker] };
            }
            else {
                var target = acc[key].markers;
                if (target[target.length - 1].time == marker.time) {
                    target[target.length - 1] = marker;
                }
                if (target[target.length - 1].time < marker.time) {
                    target.push(marker);
                }
            }
        }
        return acc;
    }, result);
    return __assign({}, result);
}
exports.appendLayoutProps = appendLayoutProps;
function transformLayout(measurements, layout) {
    var series = {};
    layout.children.forEach(function (pane) {
        return pane.children.forEach(function (layer) {
            measurements.forEach(function (measure) {
                if (layer.kind == measure.kind) {
                    if (!series[layer.key]) {
                        series[layer.key] = {
                            series: [],
                            markers: []
                        };
                    }
                    series[layer.key].series.push(transformLayer(measure, layer));
                }
                if (layer.markers) {
                    layer.markers.forEach(function (marker) {
                        if (marker.kind == measure.kind) {
                            var markerProps = transformMarker(marker, measure);
                            if (markerProps) {
                                if (!series[layer.key]) {
                                    series[layer.key] = {
                                        series: [],
                                        markers: []
                                    };
                                }
                                series[layer.key].markers.push(markerProps);
                            }
                        }
                    });
                }
            });
        });
    });
    return series;
}
exports.transformLayout = transformLayout;
function transformLayer(measure, layer) {
    switch (layer.type) {
        case 'linear':
            return transformLinearLayer(measure, layer);
        case 'area':
            return transformAreaLayer(measure, layer);
        case 'candlestick':
            return transformCandlestickLayer(measure, layer);
        case 'bar':
            return transformBarLayer(measure, layer);
        case 'histogram':
            return transformHistogramLayer(measure, layer);
    }
    throw new Error("Unknown layer type: ".concat(layer.type));
}
exports.transformLayer = transformLayer;
function transformMarker(marker, measure) {
    return __assign(__assign({ time: measure.timestamp / 1000 }, marker), { text: marker.text ? marker.text(measure) : undefined });
}
function transformLinearLayer(measure, layer) {
    return __assign({ time: measure.timestamp / 1000 }, layer.map(measure.payload));
}
exports.transformLinearLayer = transformLinearLayer;
function transformCandlestickLayer(measure, layer) {
    return __assign({ time: measure.timestamp / 1000 }, layer.map(measure.payload));
}
exports.transformCandlestickLayer = transformCandlestickLayer;
function transformAreaLayer(measure, layer) {
    return __assign({ time: measure.timestamp / 1000 }, layer.map(measure.payload));
}
exports.transformAreaLayer = transformAreaLayer;
function transformBarLayer(measure, layer) {
    return __assign({ time: measure.timestamp / 1000 }, layer.map(measure.payload));
}
exports.transformBarLayer = transformBarLayer;
function transformHistogramLayer(measure, layer) {
    return __assign({ time: measure.timestamp / 1000 }, layer.map(measure.payload));
}
exports.transformHistogramLayer = transformHistogramLayer;
