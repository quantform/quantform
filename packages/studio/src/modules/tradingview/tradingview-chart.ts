import { createChart, IChartApi } from 'lightweight-charts';
import { areas, ChartAreaTemplate } from './tradingview-area';
import { candles, ChartCandleTemplate } from './tradingview-candle';
import { ChartSeries, ChartMeasurement } from './tradingview-common';
import { ChartLineTemplate, lines } from './tradingview-line';
import { ReplaySubject } from 'rxjs';

type ChartSerieTemplate = ChartLineTemplate | ChartCandleTemplate | ChartAreaTemplate;

export class ChartViewport {
  constructor(
    private readonly minBarsBefore: number,
    private readonly maxBarsBefore: number
  ) {}

  requiresBackward() {
    return this.minBarsBefore && this.minBarsBefore < 0;
  }

  requiresForward() {
    return this.maxBarsBefore && this.maxBarsBefore < 0;
  }
}

export interface ChartTemplate {
  weight?: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  series: ChartSerieTemplate[];
  group?: string;
}

export class Chart {
  private readonly viewport$ = new ReplaySubject<ChartViewport>(1);
  private tradingview: IChartApi;
  private series: ChartSeries = {};

  get viewport() {
    return this.viewport$.asObservable();
  }

  constructor(
    private container: HTMLDivElement,
    private readonly template: ChartTemplate
  ) {
    this.tradingview = createChart(container, {
      timeScale: {
        timeVisible: true,
        borderColor: template.borderColor
      },
      rightPriceScale: {
        borderColor: template.borderColor
      },
      layout: {
        backgroundColor: template.backgroundColor,
        textColor: template.textColor
      },
      grid: {
        horzLines: {
          color: template.borderColor
        },
        vertLines: {
          color: template.borderColor
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

    this.viewport$.next(
      new ChartViewport(
        Math.max(...barsInfo.map(it => it!.barsBefore)),
        Math.min(...barsInfo.map(it => it!.barsAfter))
      )
    );
  }

  update(measure: ChartMeasurement[]) {
    Object.values(this.series).forEach(it => this.tradingview.removeSeries(it));

    this.series = {};

    for (const style of this.template.series) {
      switch (style.type) {
        case 'LINE':
          lines(this.series, this.tradingview, measure, style);
          break;
        case 'CANDLE':
          candles(this.series, this.tradingview, measure, style);
          break;
        case 'AREA':
          areas(this.series, this.tradingview, measure, style);
          break;
      }
    }

    this.invalidate();
  }
}
