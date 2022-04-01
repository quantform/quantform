import { IChartApi } from 'lightweight-charts';
import {
  aggregateTimestamp,
  ChartSeries,
  ChartMeasurement,
  intercept
} from './tradingview-common';
import { ChartMarkerTemplate, markers } from './tradingview-marker';

/**
 * Line styling properties.
 */
export interface ChartLineTemplate {
  type: 'LINE';

  name: string;
  kind: string;

  color: string;

  priceScale: number;
  priceLineVisible?: boolean;
  lastValueVisible?: boolean;

  markers?: ChartMarkerTemplate[];

  transform: (value: ChartMeasurement) => number;
}

export function lines(
  series: ChartSeries,
  chart: IChartApi,
  measure: ChartMeasurement[],
  style: ChartLineTemplate
) {
  if (!series[style.name]) {
    series[style.name] = chart.addLineSeries({
      ...style,
      lineWidth: 1,
      priceFormat: {
        type: 'custom',
        formatter: (price: any) => parseFloat(price).toFixed(style.priceScale)
      }
    });
  }

  series[style.name].setData(
    intercept(measure, style.kind, it => ({
      time: aggregateTimestamp(it.timestamp),
      value: style.transform(it.payload)
    }))
  );

  markers(style, series[style.name], measure);
}
