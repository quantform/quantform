import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';

import { Component, Instrument, InstrumentSelector } from '@lib/domain';
import { State } from '@lib/store';

export function instrument(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.universe.instrument.get(selector.id)),
      filter(it => it instanceof Instrument && it.id == selector.id),
      map(it => it as Instrument)
    );
}

export function instruments(state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it instanceof Instrument),
      map(() => state.universe.instrument.asReadonlyArray()),
      startWith(state.universe.instrument.asReadonlyArray()),
      filter(it => it.length > 0),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length)
    );
}
