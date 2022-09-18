import { Measure } from '@quantform/core';
import { AreaLayer, AreaLayerProps, BarLayer, BarLayerProps, CandlestickLayer, CandlestickLayerProps, HistogramLayer, HistogramLayerProps, Layer, LayerProps, Layout, LayoutProps, LinearLayer, LinearLayerProps } from './charting-layout';
export declare function appendLayoutProps(layout: LayoutProps, patch: LayoutProps): LayoutProps;
export declare function transformLayout(measurements: Measure[], layout: Layout): LayoutProps;
export declare function transformLayer(measure: Measure, layer: Layer): LayerProps;
export declare function transformLinearLayer(measure: Measure, layer: LinearLayer): LinearLayerProps;
export declare function transformCandlestickLayer(measure: Measure, layer: CandlestickLayer): CandlestickLayerProps;
export declare function transformAreaLayer(measure: Measure, layer: AreaLayer): AreaLayerProps;
export declare function transformBarLayer(measure: Measure, layer: BarLayer): BarLayerProps;
export declare function transformHistogramLayer(measure: Measure, layer: HistogramLayer): HistogramLayerProps;
//# sourceMappingURL=charting-layout-transformer.d.ts.map