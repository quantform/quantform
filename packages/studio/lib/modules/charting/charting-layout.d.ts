import { CandlestickSeriesPartialOptions, LineSeriesPartialOptions, AreaSeriesPartialOptions, BarSeriesPartialOptions, HistogramSeriesPartialOptions, LineData, CandlestickData, SingleValueData, BarData, HistogramData } from 'lightweight-charts';
export interface Layout {
    backgroundTopColor?: string;
    backgroundBottomColor?: string;
    borderColor?: string;
    gridColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
    children: Pane[];
}
export declare type LayoutProps = Record<string, {
    series: LayerProps[];
    markers: MarkerProps[];
}>;
export interface Pane {
    background?: string;
    children: Layer[];
}
export interface Marker {
    kind: string;
    position: 'aboveBar' | 'belowBar' | 'inBar';
    shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
    size?: number;
    color: string;
    text?: (measure: any) => string;
}
export declare type MarkerProps = Omit<Marker, 'kind' | 'text'> & {
    time: number;
    text?: string;
};
export interface Layer {
    key: string;
    type: string;
    kind: string;
    scale: number;
    markers?: Marker[];
}
export interface LayerProps {
    time: number;
}
export interface LinearLayer extends Layer, LineSeriesPartialOptions {
    map: (measure: any) => Omit<LinearLayerProps, 'time'>;
}
export interface CandlestickLayer extends Layer, CandlestickSeriesPartialOptions {
    map: (measure: any) => Omit<CandlestickLayerProps, 'time'>;
}
export interface AreaLayer extends Layer, AreaSeriesPartialOptions {
    map: (measure: any) => Omit<AreaLayerProps, 'time'>;
}
export interface BarLayer extends Layer, BarSeriesPartialOptions {
    map: (measure: any) => Omit<BarLayerProps, 'time'>;
}
export interface HistogramLayer extends Layer, HistogramSeriesPartialOptions {
    map: (measure: any) => Omit<HistogramLayerProps, 'time'>;
}
export declare type LinearLayerProps = LayerProps & Omit<LineData, 'time'>;
export declare type CandlestickLayerProps = LayerProps & Omit<CandlestickData, 'time'>;
export declare type AreaLayerProps = LayerProps & Omit<SingleValueData, 'time'>;
export declare type BarLayerProps = LayerProps & Omit<BarData, 'time'>;
export declare type HistogramLayerProps = LayerProps & Omit<HistogramData, 'time'>;
export declare function layout(layout: Layout): {
    layout: Layout;
};
export declare function pane(pane: Pane): Pane;
export declare function marker(layer: Omit<Marker, 'key' | 'type'>): {
    kind: string;
    text?: ((measure: any) => string) | undefined;
    position: "aboveBar" | "belowBar" | "inBar";
    shape: "circle" | "square" | "arrowUp" | "arrowDown";
    size?: number | undefined;
    color: string;
    type: string;
};
export declare function linear(layer: Omit<LinearLayer, 'key' | 'type'> & {
    key?: string;
}): LinearLayer;
export declare function candlestick(layer: Omit<CandlestickLayer, 'key' | 'type'> & {
    key?: string;
}): CandlestickLayer;
export declare function area(layer: Omit<AreaLayer, 'key' | 'type'> & {
    key?: string;
}): AreaLayer;
export declare function bar(layer: Omit<BarLayer, 'key' | 'type'> & {
    key?: string;
}): BarLayer;
export declare function histogram(layer: Omit<HistogramLayer, 'key' | 'type'> & {
    key?: string;
}): HistogramLayer;
//# sourceMappingURL=charting-layout.d.ts.map