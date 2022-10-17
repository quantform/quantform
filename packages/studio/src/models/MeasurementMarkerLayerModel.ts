import { Measure } from '@quantform/core';

export type MeasurementMarkerLayerModel = Omit<
  MeasurementMarkerLayer,
  'kind' | 'text'
> & {
  time: number;
  text?: string;
};

export type MeasurementMarkerLayer = {
  kind: string;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  size?: number;
  color: string;
  text?: (measure: any) => string;
};

export function marker(
  layer: Omit<MeasurementMarkerLayer, 'key' | 'type'>
): MeasurementMarkerLayer {
  return {
    ...layer
  };
}

export function toMeasurementMarkerModel(
  measure: Measure,
  layer: MeasurementMarkerLayer
): MeasurementMarkerLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer,
    text: layer.text ? layer.text(measure) : undefined
  };
}
