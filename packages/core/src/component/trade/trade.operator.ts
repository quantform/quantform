import { filter, map, Observable, startWith } from 'rxjs';

import { Component, InstrumentSelector, Trade } from '@lib/component';
import { State } from '@lib/store';

export function trade(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.trade.get(selector.id)),
      filter(it => it !== undefined && it.type === Trade.type),
      map(it => it as Trade),
      filter(it => it.instrument.id === selector.id)
    );
}
