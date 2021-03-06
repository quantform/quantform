import { filter, map, Observable, share, startWith } from 'rxjs';

import { weightedMean } from '../shared';
import { State } from '../store';
import { InstrumentSelector } from './instrument';
import { Position } from './position';

export function position(selector: InstrumentSelector) {
  return (source: Observable<Position>) =>
    source.pipe(
      filter(it => it.kind == 'position' && it.instrument.id == selector.id),
      map(it => it as Readonly<Position>)
    );
}

export function positions(selector: InstrumentSelector, state: State) {
  const getter = () =>
    Object.values(state.balance.get(selector.quote.id).position).filter(
      it => it.instrument.id == selector.id
    );

  return (source: Observable<Position>) =>
    source.pipe(
      position(selector),
      map(() => getter()),
      startWith(getter())
    );
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
