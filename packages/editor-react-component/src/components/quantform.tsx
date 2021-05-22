import React from 'react';
import { Chart, ChartStyle } from './chart';
import { Context } from '../context';

export interface QuantformStyle {
  charts: ChartStyle[];
}

export interface QuantformProps {
  address: string;
  session: string;
  style: QuantformStyle;
}

export class Quantform extends React.Component<QuantformProps, any> {
  private readonly connection: Context;

  constructor(props: QuantformProps) {
    super(props);

    this.connection = new Context(props.address, props.session);
  }

  componentDidMount() {
    this.connection.connect();
  }

  componentWillUnmount() {
    this.connection.disconnect();
  }

  render() {
    return (
      <div className="qf-chart-container">
        {this.props.style.charts.map((it, idx) => (
          <Chart key={idx} context={this.connection} style={it} />
        ))}
      </div>
    );
  }
}
