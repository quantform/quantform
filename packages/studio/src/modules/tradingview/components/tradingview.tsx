import { Layout } from '../../measurement/layout';
import React, { useEffect } from 'react';
import { TradingViewChart } from './tradingview-chart';
import { LinearLayerProps } from '../../measurement/services/measurement-transformer';

export default function TradingView(props: {
  measurement: Record<string, LinearLayerProps[]>;
  layout: Layout;
}) {
  const ref = React.createRef<HTMLDivElement>();
  const [chart, setChart] = React.useState<TradingViewChart>();

  useEffect(() => {
    setChart(new TradingViewChart(ref.current!, props.layout));

    return () => chart?.dispose();
  }, [props.layout]);

  useEffect(() => {
    chart?.update(props.measurement);
  }, [props.measurement, chart]);

  return <div className="qf-chart h-3/6" ref={ref}></div>;
}
