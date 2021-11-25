import { Instrument } from '../domain';
import { Component } from './component';
import { pnl, timestamp, weightedMean } from '../shared';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

export type PositionMode = 'CROSS' | 'ISOLATED';

export class Position implements Component {
  timestamp: timestamp;
  averageExecutionRate: number;
  size: number;
  leverage: number;
  mode: PositionMode = 'CROSS';
  estimatedUnrealizedPnL = 0;

  get margin(): number {
    return this.instrument.quote.ceil(
      (Math.abs(this.size) * this.averageExecutionRate) / this.leverage
    );
  }

  constructor(readonly id: string, readonly instrument: Instrument) {}

  calculatePnL(rate: number): number {
    this.estimatedUnrealizedPnL = pnl(this.averageExecutionRate, rate, this.size);

    return this.estimatedUnrealizedPnL;
  }

  toString() {
    return this.id;
  }
}

export function positionsFlat() {
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
