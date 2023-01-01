import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';

import { Component, Instrument, InstrumentSelector } from '@lib/component';
import { useStore } from '@lib/store';

export function fromInstrument(selector: InstrumentSelector) {
  const { snapshot } = useStore();

  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(snapshot.universe.instrument.get(selector.id)),
      filter(it => it !== undefined && it.type === Instrument.type),
      map(it => it as Instrument),
      filter(it => it.id == selector.id)
    );
}

export function fromInstruments() {
  const { snapshot } = useStore();

  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it.type === Instrument.type),
      map(() => snapshot.universe.instrument.asReadonlyArray()),
      startWith(snapshot.universe.instrument.asReadonlyArray()),
      filter(it => it.length > 0),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length)
    );
}
