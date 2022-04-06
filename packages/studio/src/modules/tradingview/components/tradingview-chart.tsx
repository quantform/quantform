import {
  createChart,
  IChartApi,
  ISeriesApi,
  SeriesMarker,
  Time,
  ColorType,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  CandlestickSeriesPartialOptions
} from 'lightweight-charts';
import { Layout } from '../../measurement/layout';
import { LayoutProps } from '../../measurement/services/measurement-transformer';

export type ChartSeries = Record<string, ISeriesApi<any>>;

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
        background: {
          type:
            layout.backgroundTopColor == layout.backgroundBottomColor
              ? ColorType.Solid
              : ColorType.VerticalGradient,
          color: layout.backgroundTopColor || layout.backgroundBottomColor,
          topColor: layout.backgroundTopColor,
          bottomColor: layout.backgroundBottomColor
        },
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

    this.container.innerHTML = '';
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

  update(measure: LayoutProps) {
    this.layout.children.forEach((pane, paneIdx) => {
      for (const layer of pane.children) {
        const key = layer.key;
        const measurement = measure[key];
        if (!measurement) {
          continue;
        }

        let series = this.series[key];

        const options = {
          ...layer,
          priceFormat: {
            type: 'custom',
            formatter: (price: any) => parseFloat(price).toFixed(2)
          },
          pane: paneIdx
        };

        if (!series) {
          switch (layer.type) {
            case 'linear':
              series = this.series[key] = this.tradingview.addLineSeries(
                options as LineSeriesPartialOptions
              );
              break;
            case 'area':
              series = this.series[key] = this.tradingview.addAreaSeries(
                options as AreaSeriesPartialOptions
              );
              break;
            case 'candlestick':
              series = this.series[key] = this.tradingview.addCandlestickSeries(
                options as CandlestickSeriesPartialOptions
              );
              break;
          }
        }

        series.setData(measurement.series);
        series.setMarkers(measurement.markers as SeriesMarker<Time>[]);
      }
    });

    this.invalidate();
  }
}
