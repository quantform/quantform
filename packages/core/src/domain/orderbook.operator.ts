import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Orderbook } from './orderbook';

export function orderbook(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.orderbook.get(selector.id)),
      filter(it => it instanceof Orderbook && it.instrument.id == selector.id),
      map(it => it as Orderbook)
    );
}
