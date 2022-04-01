import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Layout } from '../../measurement/layout';
import { LinearLayerProps } from '../../measurement/services/measurement-transformer';

export type ChartSeries = Record<string, ISeriesApi<any>>;

export function aggregateTimestamp(timestamp: number): UTCTimestamp {
  return (timestamp / 1000) as UTCTimestamp;
}

export class TradingViewChart {
  private tradingview: IChartApi;
  private series: ChartSeries = {};

  constructor(private container: HTMLDivElement, private readonly layout: Layout) {
    this.tradingview = createChart(container, {
      timeScale: {
        timeVisible: true,
        borderColor: layout.borderColor
      },
      rightPriceScale: {
        borderColor: layout.borderColor
      },
      layout: {
        backgroundColor: layout.backgroundColor,
        textColor: layout.textColor
      },
      grid: {
        horzLines: {
          color: layout.borderColor
        },
        vertLines: {
          color: layout.borderColor
        }
      }
    });

    this.tradingview
      .timeScale()
      .subscribeVisibleLogicalRangeChange(this.invalidate.bind(this));

    window.addEventListener('resize', this.fitToSize.bind(this));
  }

  dispose() {
    window.removeEventListener('resize', this.fitToSize.bind(this));

    this.tradingview
      .timeScale()
      .unsubscribeVisibleLogicalRangeChange(this.invalidate.bind(this));

    this.tradingview.remove();
  }

  fitToSize() {
    this.tradingview &&
      this.container &&
      this.tradingview.resize(this.container.clientWidth, this.container.clientHeight);
  }

  invalidate() {
    const range = this.tradingview?.timeScale()?.getVisibleLogicalRange();

    if (!range) {
      return;
    }

    const barsInfo = Object.values(this.series)
      .map(series => series.barsInLogicalRange(range))
      .filter(it => it != null);

    if (!barsInfo) {
      return;
    }
  }

  update(measure: Record<string, Array<LinearLayerProps>>) {
    for (const pane of this.layout.children) {
      for (const layer of pane.children) {
        const key = layer.key;
        const measurement = measure[key];
        if (!measurement) {
          continue;
        }

        let series = this.series[key];

        if (!series) {
          switch (layer.type) {
            case 'linear':
              series = this.series[key] = this.tradingview.addLineSeries({
                lineWidth: 1,
                priceFormat: {
                  type: 'custom',
                  formatter: (price: any) => parseFloat(price).toFixed(2)
                }
              });
              break;
            case 'candlestick':
              series = this.series[key] = this.tradingview.addCandlestickSeries({
                priceFormat: {
                  type: 'custom',
                  formatter: (price: any) => parseFloat(price).toFixed(2)
                }
              });
              break;
          }
        }
        series.setData(
          measurement.map(it => ({
            time: aggregateTimestamp(it.timestamp),
            ...it
          }))
        );
      }
    }

    this.invalidate();
  }
}
