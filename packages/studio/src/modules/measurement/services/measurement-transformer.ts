import { Measure } from '@quantform/core';
import { CandlestickLayer, Layer, Layout, LinearLayer } from '../layout';

export interface LinearLayerProps {
  timestamp: number;
  value: number;
}

export interface CandlestickLayerProps {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function transformLayout(mesures: Measure[], layout: Layout) {
  const propsByLayer: Record<
    string,
    Array<LinearLayerProps | CandlestickLayerProps>
  > = {};

  layout.children.forEach(pane =>
    pane.children.forEach(layer => {
      mesures.forEach(measure => {
        if (layer.kind != measure.kind) {
          return;
        }

        if (!propsByLayer[layer.key]) {
          propsByLayer[layer.key] = [];
        }

        propsByLayer[layer.key].push(transformLayer(measure, layer));
      });
    })
  );

  return propsByLayer;
}

export function transformLayer(
  measure: Measure,
  layer: Layer
): LinearLayerProps | CandlestickLayerProps {
  switch (layer.type) {
    case 'linear':
      return transformLinearLayer(measure, layer as LinearLayer);
    case 'candlestick':
      return transformCandlestickLayer(measure, layer as CandlestickLayer);
  }
}

export function transformLinearLayer(
  measure: Measure,
  layer: LinearLayer
): LinearLayerProps {
  return {
    timestamp: measure.timestamp,
    value: layer.value(measure.payload)
  };
}

export function transformCandlestickLayer(
  measure: Measure,
  layer: CandlestickLayer
): CandlestickLayerProps {
  return {
    timestamp: measure.timestamp,
    ...layer.value(measure.payload)
  };
}
