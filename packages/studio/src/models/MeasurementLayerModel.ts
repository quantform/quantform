import { Measure } from '@quantform/core';
import { v4 } from 'uuid';

import {
  MeasurementAreaLayer,
  toMeasurementAreaModel
} from './MeasurementAreaLayerModel';
import { MeasurementBarLayer, toMeasurementBarModel } from './MeasurementBarLayerModel';
import {
  MeasurementCandlestickLayer,
  toMeasurementCandlestickModel
} from './MeasurementCandlestickLayerModel';
import {
  MeasurementHistogramLayer,
  toMeasurementHistogramModel
} from './MeasurementHistogramLayerModel';
import {
  MeasurementLinearLayer,
  toMeasurementLinearModel
} from './MeasurementLinearLayerModel';
import { MeasurementMarkerLayer } from './MeasurementMarkerLayerModel';

export interface MeasurementLayer {
  key: string;
  type: string;
  kind: string;
  scale: number;

  markers?: MeasurementMarkerLayer[];
}

export interface MeasurementLayerModel {
  time: number;
}

export function generateLayoutKey() {
  return v4().replace(/-/g, '');
}

export function toMeasurementLayerModel(
  measure: Measure,
  layer: MeasurementLayer
): MeasurementLayerModel {
  switch (layer.type) {
    case 'linear':
      return toMeasurementLinearModel(measure, layer as MeasurementLinearLayer);
    case 'area':
      return toMeasurementAreaModel(measure, layer as MeasurementAreaLayer);
    case 'candlestick':
      return toMeasurementCandlestickModel(measure, layer as MeasurementCandlestickLayer);
    case 'bar':
      return toMeasurementBarModel(measure, layer as MeasurementBarLayer);
    case 'histogram':
      return toMeasurementHistogramModel(measure, layer as MeasurementHistogramLayer);
  }

  throw new Error(`Unknown layer type: ${layer.type}`);
}
