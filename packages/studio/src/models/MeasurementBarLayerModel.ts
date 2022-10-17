import { Measure } from '@quantform/core';
import { BarData, BarSeriesPartialOptions } from 'lightweight-charts';

import {
  generateLayoutKey,
  MeasurementLayer,
  MeasurementLayerModel
} from './MeasurementLayerModel';

export type MeasurementBarLayerModel = MeasurementLayerModel & Omit<BarData, 'time'>;

export type MeasurementBarLayer = MeasurementLayer &
  BarSeriesPartialOptions & {
    map: (measure: any) => Omit<MeasurementBarLayerModel, 'time'>;
  };

export function bar(
  layer: Omit<MeasurementBarLayer, 'key' | 'type'> & { key?: string }
): MeasurementBarLayer {
  return {
    key: layer.key ?? generateLayoutKey(),
    type: 'bar',
    ...layer
  };
}

export function toMeasurementBarModel(
  measure: Measure,
  layer: MeasurementBarLayer
): MeasurementBarLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer.map(measure.payload)
  };
}
