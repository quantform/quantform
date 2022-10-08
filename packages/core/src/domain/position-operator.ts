import { filter, map, Observable, share, startWith } from 'rxjs';

import { d, decimal, weightedMean } from '../shared';
import { State } from '../store';
import { Component } from './component';
import { invalidInstrumentSelectorError } from './error';
import { InstrumentSelector } from './instrument';
import { Position } from './position';

export function position(selector: InstrumentSelector) {
  return (source: Observable<Component>) =>
    source.pipe(
      filter(it => it instanceof Position && it.instrument.id == selector.id),
      map(it => it as Readonly<Position>)
    );
}

export function positions(selector: InstrumentSelector, state: State) {
  const balance = state.balance.get(selector.quote.id);
  if (!balance) {
    throw invalidInstrumentSelectorError(selector.id);
  }

  const getter = () =>
    Object.values(balance.position)
      .filter(it => it.instrument.id == selector.id)
      .map(it => it as Readonly<Position>);

  return (source: Observable<Component>) =>
    source.pipe(
      position(selector),
      map(() => getter()),
      startWith(getter())
    );
}

export function flatten() {
  return function (
    source: Observable<Position[]>
  ): Observable<{ size: decimal; rate: decimal }> {
    return source.pipe(
      map(it => {
        if (it.length > 1) {
          return {
            size: it.reduce(
              (aggregate, position) => aggregate.add(position.size),
              d.Zero
            ),
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
          size: d.Zero,
          rate: d.Zero
        };
      }),
      share()
    );
  };
}