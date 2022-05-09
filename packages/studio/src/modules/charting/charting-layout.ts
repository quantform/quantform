import { v4 as uuidv4 } from 'uuid';
import {
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  BarSeriesPartialOptions,
  HistogramSeriesPartialOptions,
  LineData,
  CandlestickData,
  SingleValueData,
  BarData,
  HistogramData
} from 'lightweight-charts';

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

export type LayoutProps = Record<
  string,
  {
    series: LayerProps[];
    markers: MarkerProps[];
  }
>;

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

export type MarkerProps = Omit<Marker, 'kind' | 'text'> & {
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

export type LinearLayerProps = LayerProps & Omit<LineData, 'time'>;
export type CandlestickLayerProps = LayerProps & Omit<CandlestickData, 'time'>;
export type AreaLayerProps = LayerProps & Omit<SingleValueData, 'time'>;
export type BarLayerProps = LayerProps & Omit<BarData, 'time'>;
export type HistogramLayerProps = LayerProps & Omit<HistogramData, 'time'>;

export function layout(layout: Layout) {
  return { layout };
}

export function pane(pane: Pane) {
  return pane;
}

export function marker(layer: Omit<Marker, 'key' | 'type'>) {
  return {
    type: 'marker',
    ...layer
  };
}

export function linear(
  layer: Omit<LinearLayer, 'key' | 'type'> & { key?: string }
): LinearLayer {
  return {
    key: layer.key ?? generateKey(),
    type: 'linear',
    ...layer
  };
}

export function candlestick(
  layer: Omit<CandlestickLayer, 'key' | 'type'> & { key?: string }
): CandlestickLayer {
  return {
    key: layer.key ?? generateKey(),
    type: 'candlestick',
    borderUpColor: layer.upColor,
    borderDownColor: layer.downColor,
    wickUpColor: layer.upColor,
    wickDownColor: layer.downColor,
    ...layer
  };
}

export function area(
  layer: Omit<AreaLayer, 'key' | 'type'> & { key?: string }
): AreaLayer {
  return {
    key: layer.key ?? generateKey(),
    type: 'area',
    ...layer
  };
}

export function bar(layer: Omit<BarLayer, 'key' | 'type'> & { key?: string }): BarLayer {
  return {
    key: layer.key ?? generateKey(),
    type: 'bar',
    ...layer
  };
}

export function histogram(
  layer: Omit<HistogramLayer, 'key' | 'type'> & { key?: string }
): HistogramLayer {
  return {
    key: layer.key ?? generateKey(),
    type: 'histogram',
    ...layer
  };
}

function generateKey() {
  return uuidv4().replace(/-/g, '');
}
