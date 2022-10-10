import { Measure } from '@quantform/core';
import { LineData, LineSeriesPartialOptions } from 'lightweight-charts';

import {
  generateLayoutKey,
  MeasurementLayer,
  MeasurementLayerModel
} from './MeasurementLayerModel';

export type MeasurementLinearLayerModel = MeasurementLayerModel & Omit<LineData, 'time'>;

export type MeasurementLinearLayer = MeasurementLayer &
  LineSeriesPartialOptions & {
    map: (measure: any) => Omit<MeasurementLinearLayerModel, 'time'>;
  };

export function linear(
  layer: Omit<MeasurementLinearLayer, 'key' | 'type'> & { key?: string }
): MeasurementLinearLayer {
  return {
    key: layer.key ?? generateLayoutKey(),
    type: 'linear',
    ...layer
  };
}

export function toMeasurementLinearModel(
  measure: Measure,
  layer: MeasurementLinearLayer
): MeasurementLinearLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer.map(measure.payload)
  };
}
