import { useEffect, useRef, useState } from 'react';
import { Layout, LayoutProps } from '../charting-layout';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  SeriesMarker,
  Time,
  ColorType,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  CandlestickSeriesPartialOptions,
  BarSeriesPartialOptions,
  BaselineSeriesPartialOptions,
  HistogramSeriesPartialOptions
} from 'lightweight-charts';

function createTradingViewChart(chartContainer: HTMLElement, layout: Layout) {
  return createChart(chartContainer, {
    width: chartContainer.clientWidth,
    height: chartContainer.clientHeight,
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
      textColor: layout.textColor,
      fontFamily: 'JetBrains Mono'
    },
    grid: {
      horzLines: {
        color: layout.gridColor
      },
      vertLines: {
        color: layout.gridColor
      }
    }
  });
}

function createTradingViewSeries(chart: IChartApi, layout: Layout) {
  return layout.children.reduce((series, pane, index) => {
    for (const layer of pane.children) {
      const options = {
        ...layer,
        priceFormat: {
          type: 'custom',
          formatter: (price: any) => parseFloat(price).toFixed(layer.scale)
        },
        pane: index
      };

      switch (layer.type) {
        case 'linear':
          series[layer.key] = chart.addLineSeries(options as LineSeriesPartialOptions);
          break;
        case 'area':
          series[layer.key] = chart.addAreaSeries(options as AreaSeriesPartialOptions);
          break;
        case 'candlestick':
          series[layer.key] = chart.addCandlestickSeries(
            options as CandlestickSeriesPartialOptions
          );
          break;
        case 'bar':
          series[layer.key] = chart.addBarSeries(options as BarSeriesPartialOptions);
          break;
        case 'histogram':
          series[layer.key] = chart.addHistogramSeries(
            options as HistogramSeriesPartialOptions
          );
          break;
      }
    }

    return series;
  }, {} as ChartSeries);
}

export class ChartViewport {
  constructor(
    private readonly barsBefore: number,
    private readonly barsAfter: number,
    readonly from: number,
    readonly to: number
  ) {}

  get requiresBackward() {
    return this.barsBefore && this.barsBefore < 0;
  }

  get requiresForward() {
    return this.barsAfter && this.barsAfter < 0;
  }
}

export type ChartSeries = Record<string, ISeriesApi<any>>;

export default function ChartingView(props: {
  measurement: { snapshot: LayoutProps; patched: LayoutProps };
  layout: Layout;
  viewportChanged?: (viewport: ChartViewport) => void;
}) {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const chart = useRef<IChartApi>();
  const [chartSeries, setSeries] = useState<ChartSeries>({});
  const resizeObserver = useRef<ResizeObserver>();

  useEffect(() => {
    const { layout } = props;
    const newChart = createTradingViewChart(chartContainerRef.current!, layout);

    setSeries(createTradingViewSeries(newChart, layout));

    chart.current = newChart;

    return () => newChart.remove();
  }, []);

  useEffect(() => {
    const visibleLogicalRangeHandler = () => {
      const range = chart.current!.timeScale()?.getVisibleLogicalRange();

      if (!range) {
        return;
      }

      const barsInfo = Object.values(chartSeries)
        .map(series => series.barsInLogicalRange(range))
        .filter(it => it != null);

      if (!barsInfo) {
        return;
      }

      const viewport = new ChartViewport(
        Math.max(...barsInfo.map(it => it!.barsBefore)),
        Math.min(...barsInfo.map(it => it!.barsAfter)),
        Math.min(...barsInfo.map(it => it!.from as number)),
        Math.max(...barsInfo.map(it => it!.to as number))
      );

      if (props.viewportChanged) {
        props.viewportChanged(viewport);
      }
    };

    chart
      .current!.timeScale()
      .subscribeVisibleLogicalRangeChange(visibleLogicalRangeHandler);

    return () =>
      chart
        .current!.timeScale()
        .unsubscribeVisibleLogicalRangeChange(visibleLogicalRangeHandler);
  }, [chart, chartSeries]);

  useEffect(() => {
    const patched = Object.keys(props.measurement.patched);

    if (patched.length > 0) {
      patched.forEach(key => {
        const series = chartSeries[key];

        props.measurement.patched[key].series.forEach(it => series.update(it));
      });
    } else {
      Object.keys(props.measurement.snapshot).forEach(key => {
        const measurement = props.measurement.snapshot[key];
        const series = chartSeries[key];

        series.setData(measurement.series);
        series.setMarkers(measurement.markers as SeriesMarker<Time>[]);
      });
    }
  }, [props.measurement, chartSeries]);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      chart.current!.resize(
        chartContainerRef.current!.clientWidth,
        chartContainerRef.current!.clientHeight
      );
    });

    resizeObserver.current.observe(chartContainerRef.current!);

    return () => resizeObserver.current!.disconnect();
  }, []);

  return <div className=" h-full" ref={chartContainerRef} />;
}
