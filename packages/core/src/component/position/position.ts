import { Component, Instrument } from '@lib/component';
import { decimal, hash, pnl } from '@lib/shared';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  static type = hash(Position.name);
  readonly type = Position.type;

  estimatedUnrealizedPnL?: decimal;

  get margin(): decimal {
    return this.instrument.quote.floor(this.size.abs().div(this.leverage));
  }

  constructor(
    public timestamp: number,
    readonly id: string,
    readonly instrument: Instrument,
    readonly mode: PositionMode,
    public averageExecutionRate: decimal,
    public size: decimal,
    public leverage: number
  ) {}

  calculateEstimatedUnrealizedPnL(rate: decimal): decimal {
    this.estimatedUnrealizedPnL = this.instrument.quote.floor(
      pnl(this.averageExecutionRate, rate, this.size)
    );

    return this.estimatedUnrealizedPnL;
  }
}
