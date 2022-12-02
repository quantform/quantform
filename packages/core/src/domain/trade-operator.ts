import { filter, map, Observable, startWith } from 'rxjs';

import { Component, InstrumentSelector, Trade } from '@lib/domain';
import { State } from '@lib/store';

export function trade(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.trade.get(selector.id)),
      filter(it => it instanceof Trade && it.instrument.id == selector.id),
      map(it => it as Trade)
    );
}
