import { CandlestickSeriesPartialOptions, IChartApi } from 'lightweight-charts';
import {
  aggregateTimestamp,
  ChartSeries,
  ChartMeasurement,
  intercept
} from './tradingview-common';
import { ChartMarkerTemplate, markers } from './tradingview-marker';

export type ChartCandleTemplate = CandlestickSeriesPartialOptions & {
  type: 'CANDLE';

  name: string;
  kind: string;
  priceScale: number;

  markers?: ChartMarkerTemplate[];

  transform: (value: ChartMeasurement) => {
    open: number;
    high: number;
    low: number;
    close: number;
  };
};

export function candles(
  series: ChartSeries,
  chart: IChartApi,
  measure: ChartMeasurement[],
  style: ChartCandleTemplate
) {
  if (!series[style.name]) {
    series[style.name] = chart.addCandlestickSeries({
      ...style,
      priceFormat: {
        type: 'custom',
        formatter: (price: any) => parseFloat(price).toFixed(style.priceScale)
      }
    });
  }

  series[style.name].setData(
    intercept(measure, style.kind, it => ({
      time: aggregateTimestamp(it.timestamp),
      ...style.transform(it.payload)
    }))
  );

  markers(style, series[style.name], measure);
}
