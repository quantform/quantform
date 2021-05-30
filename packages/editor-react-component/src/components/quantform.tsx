import React from 'react';
import { Chart, ChartTemplate } from './chart';
import { MeasureContext, MeasureProvider } from '../context';

export interface QuantformTemplate {
  charts: ChartTemplate[];
}

export interface QuantformProps {
  provider: MeasureProvider;
  template: QuantformTemplate;
}

export class Quantform extends React.Component<QuantformProps, any> {
  private readonly measure: MeasureContext;

  constructor(props: QuantformProps) {
    super(props);

    this.measure = new MeasureContext(props.provider);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <div className="qf-chart-container">
        {this.props.template.charts.map((it, idx) => (
          <Chart key={idx} context={this.measure} template={it} />
        ))}
      </div>
    );
  }
}
