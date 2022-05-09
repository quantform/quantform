import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Trade } from './trade';

export function trade(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.trade.get(selector.id)),
      filter(it => it instanceof Trade && it.instrument.id == selector.id),
      map(it => it as Trade)
    );
}
