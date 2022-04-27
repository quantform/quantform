import { map, Observable, share } from 'rxjs';

import { Instrument } from '../domain';
import { pnl, timestamp, weightedMean } from '../shared';
import { Component } from './component';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  kind = 'position';
  timestamp: timestamp;
  estimatedUnrealizedPnL?: number;

  get margin(): number {
    return this.instrument.quote.fixed(Math.abs(this.size) / this.leverage);
  }

  constructor(
    readonly id: string,
    readonly instrument: Instrument,
    readonly mode: PositionMode,
    public averageExecutionRate: number,
    public size: number,
    public leverage: number
  ) {}

  calculateEstimatedUnrealizedPnL(rate: number): number {
    this.estimatedUnrealizedPnL = this.instrument.quote.fixed(
      pnl(this.averageExecutionRate, rate, this.size)
    );

    return this.estimatedUnrealizedPnL;
  }

  toString() {
    return this.id;
  }
}

export function flatten() {
  return function (
    source: Observable<Position[]>
  ): Observable<{ size: number; rate: number }> {
    return source.pipe(
      map(it => {
        if (it.length > 1) {
          return {
            size: it.reduce((aggregate, position) => aggregate + position.size, 0),
            rate: weightedMean(
              it.map(x => x.averageExecutionRate),
              it.map(x => x.size)
            )
          };
        }

        if (it.length == 1) {
          return {
            size: it[0].size,
            rate: it[0].averageExecutionRate
          };
        }

        return {
          size: 0,
          rate: 0
        };
      }),
      share()
    );
  };
}
