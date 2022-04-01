import React, { useEffect } from 'react';
import { Chart, ChartTemplate } from '.';
import { useSessionContext } from '../editor/editor-context';
import { debounceTime } from 'rxjs';

export function TradingView(props: { template: ChartTemplate }) {
  const session = useSessionContext();
  const container = React.createRef<HTMLDivElement>();
  const [chart, setChart] = React.useState<Chart>();

  useEffect(() => {
    setChart(new Chart(container.current!, props.template));

    return () => chart?.dispose();
  }, [props.template]);

  useEffect(() => {
    const subscription = session.measurement.subscribe(it => chart?.update(it));

    return () => subscription.unsubscribe();
  }, [chart]);

  useEffect(() => {
    const subscription = chart?.viewport.pipe(debounceTime(500)).subscribe(viewport => {
      if (viewport.requiresBackward()) {
        session.fetchBackward();
      }

      if (viewport.requiresForward()) {
        session.fetchForward();
      }
    });

    return () => subscription?.unsubscribe();
  }, [chart]);

  const style = {
    flex: props.template.weight ? props.template.weight : 1
  };

  return <div className="qf-chart" style={style} ref={container}></div>;
}
