import { Measure } from '@quantform/core';
import { HistogramData, HistogramSeriesPartialOptions } from 'lightweight-charts';

import {
  generateLayoutKey,
  MeasurementLayer,
  MeasurementLayerModel
} from './MeasurementLayerModel';

export type MeasurementHistogramLayerModel = MeasurementLayerModel &
  Omit<HistogramData, 'time'>;

export type MeasurementHistogramLayer = MeasurementLayer &
  HistogramSeriesPartialOptions & {
    map: (measure: any) => Omit<MeasurementHistogramLayerModel, 'time'>;
  };

export function histogram(
  layer: Omit<MeasurementHistogramLayer, 'key' | 'type'> & { key?: string }
): MeasurementHistogramLayer {
  return {
    key: layer.key ?? generateLayoutKey(),
    type: 'histogram',
    ...layer
  };
}

export function toMeasurementHistogramModel(
  measure: Measure,
  layer: MeasurementHistogramLayer
): MeasurementHistogramLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer.map(measure.payload)
  };
}
