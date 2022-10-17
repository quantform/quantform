import { Measure } from '@quantform/core';
import { AreaSeriesPartialOptions, SingleValueData } from 'lightweight-charts';

import {
  generateLayoutKey,
  MeasurementLayer,
  MeasurementLayerModel
} from './MeasurementLayerModel';

export type MeasurementAreaLayerModel = MeasurementLayerModel &
  Omit<SingleValueData, 'time'>;

export type MeasurementAreaLayer = MeasurementLayer &
  AreaSeriesPartialOptions & {
    map: (measure: any) => Omit<MeasurementAreaLayerModel, 'time'>;
  };

export function area(
  layer: Omit<MeasurementAreaLayer, 'key' | 'type'> & { key?: string }
): MeasurementAreaLayer {
  return {
    key: layer.key ?? generateLayoutKey(),
    type: 'area',
    ...layer
  };
}

export function toMeasurementAreaModel(
  measure: Measure,
  layer: MeasurementAreaLayer
): MeasurementAreaLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer.map(measure.payload)
  };
}
