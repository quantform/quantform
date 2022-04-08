import { Measure } from '@quantform/core';
import {
  AreaLayer,
  CandlestickLayer,
  Layer,
  Layout,
  LinearLayer,
  Marker
} from '../layout';

export interface MarkerProps {
  time: number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  color: string;
  size?: number;
  text?: string;
}

export interface LayerProps {
  time: number;
}

export type LayoutProps = Record<
  string,
  {
    series: LayerProps[];
    markers: MarkerProps[];
  }
>;

export function appendLayoutProps(layout: LayoutProps, patch: LayoutProps): LayoutProps {
  const result = { ...layout };

  Object.keys(patch).reduce((acc, key) => {
    for (const props of patch[key].series) {
      if (!acc[key]) {
        acc[key] = { series: [props], markers: [] };
      } else {
        const target = acc[key].series;
        if (target[target.length - 1].time == props.time) {
          target[target.length - 1] = props;
        }
        if (target[target.length - 1].time < props.time) {
          target.push(props);
        }
      }
    }

    return acc;
  }, result);

  return { ...result };
}

export interface LinearLayerProps extends LayerProps {
  value: number;
}

export interface CandlestickLayerProps extends LayerProps {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface AreaLayerProps extends LayerProps {
  value: number;
}

export function transformLayout(mesures: Measure[], layout: Layout) {
  const series: LayoutProps = {};

  layout.children.forEach(pane =>
    pane.children.forEach(layer => {
      mesures.forEach(measure => {
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
          layer.markers.forEach(marker => {
            if (marker.kind == measure.kind) {
              const markerProps = transformMarker(marker, measure);
              if (markerProps) {
                series[layer.key].markers.push(markerProps);
              }
            }
          });
        }
      });
    })
  );

  return series;
}

export function transformLayer(
  measure: Measure,
  layer: Layer
): LinearLayerProps | CandlestickLayerProps | AreaLayerProps {
  switch (layer.type) {
    case 'linear':
      return transformLinearLayer(measure, layer as LinearLayer);
    case 'area':
      return transformAreaLayer(measure, layer as AreaLayer);
    case 'candlestick':
      return transformCandlestickLayer(measure, layer as CandlestickLayer);
  }
}

function transformMarker(marker: Marker, measure: Measure) {
  return {
    time: measure.timestamp / 1000,
    ...marker,
    text: marker.text ? marker.text(measure) : undefined
  };
}

export function transformLinearLayer(
  measure: Measure,
  layer: LinearLayer
): LinearLayerProps {
  return {
    time: measure.timestamp / 1000,
    value: layer.value(measure.payload)
  };
}

export function transformCandlestickLayer(
  measure: Measure,
  layer: CandlestickLayer
): CandlestickLayerProps {
  return {
    time: measure.timestamp / 1000,
    ...layer.value(measure.payload)
  };
}

export function transformAreaLayer(measure: Measure, layer: AreaLayer): AreaLayerProps {
  return {
    time: measure.timestamp / 1000,
    value: layer.value(measure.payload)
  };
}
