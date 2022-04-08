import { useEffect, useRef, useState } from 'react';
import { Layout } from '../../measurement/layout';
import { LayoutProps } from '../../measurement/services/measurement-transformer';
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
}

function createTradingViewSeries(chart: IChartApi, layout: Layout) {
  return layout.children.reduce((series, pane, index) => {
    for (const layer of pane.children) {
      const options = {
        ...layer,
        priceFormat: {
          type: 'custom',
          formatter: (price: any) => parseFloat(price).toFixed(2)
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
      }
    }

    return series;
  }, {});
}

export type ChartSeries = Record<string, ISeriesApi<any>>;

export default function TradingView(props: {
  measurement: { snapshot: LayoutProps; patched: LayoutProps };
  layout: Layout;
}) {
  const chartContainerRef = useRef<HTMLElement>();
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
  }, [props.measurement, chart.current]);

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
