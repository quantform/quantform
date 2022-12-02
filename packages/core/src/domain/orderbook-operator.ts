import { filter, map, Observable, startWith } from 'rxjs';

import { Component, InstrumentSelector, Orderbook } from '@lib/domain';
import { State } from '@lib/store';

export function orderbook(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.orderbook.get(selector.id)),
      filter(it => it instanceof Orderbook && it.instrument.id == selector.id),
      map(it => it as Orderbook)
    );
}
