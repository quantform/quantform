import { Measure } from '@quantform/core';
import { CandlestickData, CandlestickSeriesPartialOptions } from 'lightweight-charts';

import {
  generateLayoutKey,
  MeasurementLayer,
  MeasurementLayerModel
} from './MeasurementLayerModel';

export type MeasurementCandlestickLayerModel = MeasurementLayerModel &
  Omit<CandlestickData, 'time'>;

export type MeasurementCandlestickLayer = MeasurementLayer &
  CandlestickSeriesPartialOptions & {
    map: (measure: any) => Omit<MeasurementCandlestickLayerModel, 'time'>;
  };

export function candlestick(
  layer: Omit<MeasurementCandlestickLayer, 'key' | 'type'> & { key?: string }
): MeasurementCandlestickLayer {
  return {
    key: layer.key ?? generateLayoutKey(),
    type: 'candlestick',
    borderUpColor: layer.upColor,
    borderDownColor: layer.downColor,
    wickUpColor: layer.upColor,
    wickDownColor: layer.downColor,
    ...layer
  };
}

export function toMeasurementCandlestickModel(
  measure: Measure,
  layer: MeasurementCandlestickLayer
): MeasurementCandlestickLayerModel {
  return {
    time: measure.timestamp / 1000,
    ...layer.map(measure.payload)
  };
}
