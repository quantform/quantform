import { v4 as uuidv4 } from 'uuid';
import {
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions
} from 'lightweight-charts';

export interface Layout {
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  borderColor?: string;
  gridColor?: string;
  textColor?: string;
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
  value: (measure: any) => number;
}

export type LinearLayerProps = LayerProps & {
  value: number;
};

export interface CandlestickLayer extends Layer, CandlestickSeriesPartialOptions {
  value: (measure: any) => { open: number; high: number; low: number; close: number };
}

export type CandlestickLayerProps = LayerProps & {
  open: number;
  high: number;
  low: number;
  close: number;
};

export interface AreaLayer extends Layer, AreaSeriesPartialOptions {
  value: (measure: any) => number;
}

export type AreaLayerProps = LayerProps & {
  value: number;
};

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

export function linear(layer: Omit<LinearLayer, 'key' | 'type'>): LinearLayer {
  return {
    key: generateKey(),
    type: 'linear',
    ...layer
  };
}

export function candlestick(
  layer: Omit<CandlestickLayer, 'key' | 'type'>
): CandlestickLayer {
  return {
    key: generateKey(),
    type: 'candlestick',
    borderUpColor: layer.upColor,
    borderDownColor: layer.downColor,
    wickUpColor: layer.upColor,
    wickDownColor: layer.downColor,
    ...layer
  };
}

export function area(layer: Omit<AreaLayer, 'key' | 'type'>): AreaLayer {
  return {
    key: generateKey(),
    type: 'area',
    ...layer
  };
}

function generateKey() {
  return uuidv4().replace(/-/g, '');
}
