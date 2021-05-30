import React from 'react';
import {
  BarData,
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
  UTCTimestamp,
  WhitespaceData
} from 'lightweight-charts';
import { Measure, MeasureContext } from '../context';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface ChartTemplate {
  weight?: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  series: ChartSerieTemplate[];
}

export interface ChartSerieTemplate {
  name: string;
  key: string;
  color: string;
  type: 'LINE' | 'CANDLE' | 'AREA';
  priceScale: number;
  transform: (value: Measure) => any;
  markers?: ChartMarkerTemplate[];
}

export interface ChartMarkerTemplate {
  key: string;
  color: string;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  size?: number;
  text: (value: Measure) => string;
}

export type ChartProps = {
  context: MeasureContext;
  template: ChartTemplate;
};

export class Timeframe {
  static S1 = 1000;
  static M1 = Timeframe.S1 * 60;
  static M5 = Timeframe.M1 * 5;
  static M15 = Timeframe.M5 * 3;
  static M30 = Timeframe.M15 * 2;
  static H1 = Timeframe.M30 * 2;
  static H4 = Timeframe.H1 * 4;
  static H6 = Timeframe.H1 * 6;
  static H12 = Timeframe.H6 * 2;
  static D1 = Timeframe.H12 * 2;
  static W1 = Timeframe.D1 * 7;
}

export function tf(timestamp: number, timeframe: number): number {
  return timestamp - (timestamp % timeframe);
}

export class Chart extends React.Component<ChartProps, any> {
  private container: React.RefObject<HTMLDivElement>;
  private subscription?: Subscription;
  private chart?: IChartApi;
  private serie: Record<string, ISeriesApi<any>> = {};

  constructor(props: ChartProps) {
    super(props);

    this.container = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.fitToSize());

    this.chart = createChart(this.container.current!, {
      timeScale: {
        timeVisible: true,
        borderColor: this.props.template.borderColor
      },
      rightPriceScale: {
        borderColor: this.props.template.borderColor
      },
      layout: {
        backgroundColor: this.props.template.backgroundColor,
        textColor: this.props.template.textColor
      },
      grid: {
        horzLines: {
          color: this.props.template.borderColor
        },
        vertLines: {
          color: this.props.template.borderColor
        }
      }
    });

    this.subscription = this.props.context.serie$
      .pipe(map(it => this.updateTimeSerie(it)))
      .subscribe();

    this.props.context.viewport$
      .pipe(tap(it => this.chart?.timeScale().setVisibleLogicalRange(it)))
      .subscribe();

    this.chart?.timeScale().subscribeVisibleLogicalRangeChange(range => {
      this.props.context.setViewport(range);
    });

    this.fitToSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.fitToSize());

    this.subscription?.unsubscribe();
    this.chart?.remove();
    this.chart = undefined;
  }

  render() {
    const style = {
      flex: this.props.template.weight ? this.props.template.weight : 1
    };

    return <div className="qf-chart" style={style} ref={this.container}></div>;
  }

  fitToSize() {
    if (!this.chart || !this.container.current) {
      return;
    }

    this.chart.resize(
      this.container.current.clientWidth,
      this.container.current.clientHeight
    );
  }

  private updateTimeSerie(measure: Measure[]) {
    Object.values(this.serie).forEach(it => this.chart?.removeSeries(it));

    for (const style of this.props.template.series) {
      switch (style.type) {
        case 'LINE':
          this.updateLineSerie(measure, style);
          break;
        case 'CANDLE':
          this.updateCandleSerie(measure, style);
          break;
        case 'AREA':
          this.updateAreaSerie(measure, style);
          break;
      }
    }
  }

  private aggregateTimestamp(timestamp: number): UTCTimestamp {
    return (tf(timestamp, Timeframe.M30) / 1000) as UTCTimestamp;
  }

  private intercept(
    measure: Measure[],
    key: string,
    factory: (it: Measure) => { time: Time }
  ): Array<{ time: Time }> {
    return measure.reduce((aggregate, measurement) => {
      const timestamp = this.aggregateTimestamp(measurement.timestamp);
      const last = aggregate[aggregate.length - 1];

      if (last && last.time == timestamp) {
        if (measurement.type == key) {
          aggregate[aggregate.length - 1] = factory(measurement);
        }
      } else {
        aggregate.push(
          measurement.type == key
            ? factory(measurement)
            : this.createWhitespace(measurement)
        );
      }

      return aggregate;
    }, new Array<{ time: Time }>());
  }

  private createWhitespace(measure: Measure): WhitespaceData {
    return {
      time: this.aggregateTimestamp(measure.timestamp)
    };
  }

  /**
   * Line Serie creation methods
   */

  private createLineMeasure(
    measure: Measure,
    style: ChartSerieTemplate
  ): LineData | WhitespaceData {
    return {
      time: this.aggregateTimestamp(measure.timestamp),
      value: style.transform(measure)
    };
  }

  private createLineSerie(style: ChartSerieTemplate): ISeriesApi<any> {
    return this.chart!.addLineSeries({
      color: style.color,
      priceFormat: {
        type: 'custom',
        formatter: (price: any) => parseFloat(price).toFixed(style.priceScale)
      }
    });
  }

  private updateLineSerie(measure: Measure[], style: ChartSerieTemplate) {
    if (!this.serie[style.name]) {
      this.serie[style.name] = this.createLineSerie(style);
    }

    this.serie[style.name].setData(
      this.intercept(measure, style.key, it => this.createLineMeasure(it, style))
    );

    this.renderMarkers(style, this.serie[style.name], measure);
  }

  /**
   * Candle Serie creation methods
   */

  private createCandleMeasure(
    measure: Measure,
    style: ChartSerieTemplate
  ): BarData | WhitespaceData {
    return {
      time: this.aggregateTimestamp(measure.timestamp),
      ...style.transform(measure)
    };
  }

  private createCandleSerie(style: ChartSerieTemplate): ISeriesApi<any> {
    return this.chart!.addCandlestickSeries({
      priceFormat: {
        type: 'custom',
        formatter: (price: any) => parseFloat(price).toFixed(style.priceScale)
      }
    });
  }

  private updateCandleSerie(measure: Measure[], style: ChartSerieTemplate) {
    if (!this.serie[style.name]) {
      this.serie[style.name] = this.createCandleSerie(style);
    }

    this.serie[style.name].setData(
      this.intercept(measure, style.key, it => this.createCandleMeasure(it, style))
    );

    this.renderMarkers(style, this.serie[style.name], measure);
  }

  /**
   * Area Serie creation methods
   */

  private createAreaMeasure(
    measure: Measure,
    style: ChartSerieTemplate
  ): LineData | WhitespaceData {
    return {
      time: this.aggregateTimestamp(measure.timestamp),
      value: style.transform(measure)
    };
  }

  private createAreaSerie(style: ChartSerieTemplate): ISeriesApi<'Area'> {
    return this.chart!.addAreaSeries({
      priceFormat: {
        type: 'custom',
        formatter: (price: any) => parseFloat(price).toFixed(style.priceScale)
      }
    });
  }

  private updateAreaSerie(measure: Measure[], style: ChartSerieTemplate) {
    if (!this.serie[style.name]) {
      this.serie[style.name] = this.createAreaSerie(style);
    }

    this.serie[style.name].setData(
      this.intercept(measure, style.key, it => this.createAreaMeasure(it, style))
    );

    this.renderMarkers(style, this.serie[style.name], measure);
  }

  /**
   * Marker creation methods
   */

  private renderMarkers(
    style: ChartSerieTemplate,
    serie: ISeriesApi<any>,
    measure: Measure[]
  ) {
    if (!style.markers) {
      return;
    }

    for (const marker of style.markers) {
      serie.setMarkers(
        measure
          .filter(it => it.type == marker.key)
          .map(it => ({
            time: this.aggregateTimestamp(it.timestamp),
            color: marker.color,
            position: marker.position,
            shape: marker.shape,
            size: marker.size,
            text: marker.text(it)
          }))
      );
    }
  }
}
