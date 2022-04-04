import { v4 as uuidv4 } from 'uuid';

export interface Layout {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  children: Pane[];
}

export function layout(layout: Layout) {
  return { layout };
}

export interface Pane {
  background?: string;
  children: Layer[];
}

export function pane(pane: Pane) {
  return pane;
}

export interface Marker {
  kind: string;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  size?: number;
  color: string;
  text?: (measure: any) => string;
}

export interface Layer {
  key: string;
  type: string;
  kind: string;

  markers?: Marker[];
}

export interface LinearLayer extends Layer {
  value: (measure: any) => number;
}

export function linear(layer: Omit<LinearLayer, 'key' | 'type'>): LinearLayer {
  return {
    key: generateKey(),
    type: 'linear',
    ...layer
  };
}

export interface CandlestickLayer extends Layer {
  value: (measure: any) => { open: number; high: number; low: number; close: number };
}

export function candlestick(
  layer: Omit<CandlestickLayer, 'key' | 'type'>
): CandlestickLayer {
  return {
    key: generateKey(),
    type: 'candlestick',
    ...layer
  };
}

export function marker(layer: Omit<Marker, 'key' | 'type'>) {
  return {
    type: 'marker',
    ...layer
  };
}

function generateKey() {
  return uuidv4().replace(/-/g, '');
}
