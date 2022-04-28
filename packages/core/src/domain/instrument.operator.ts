import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { Instrument, InstrumentSelector } from './instrument';

export function instrument(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it instanceof Instrument && it.toString() == selector.toString()),
      map(it => it as Instrument)
    );
}

export function instruments(state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it instanceof Instrument),
      map(() => Object.values(state.universe.instrument)),
      startWith(Object.values(state.universe.instrument)),
      filter(it => it.length > 0),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length)
    );
}
