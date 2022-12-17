import { filter, map, Observable, startWith } from 'rxjs';

import { Component, InstrumentSelector, Order } from '@lib/domain';
import { useContext } from '@lib/shared';
import { State, Store } from '@lib/store';

export function fromOrder(selector: InstrumentSelector) {
  const store = useContext(Store);

  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it !== undefined && it.type === Order.type),
      map(it => it as Order),
      filter(it => it.instrument.id === selector.id)
    );
}

export function orders(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it.type === Order.type),
      map(it => it as Order),
      filter(it => it.instrument.id === selector.id),
      map(() => state.order.get(selector.id)?.asReadonlyArray() ?? []),
      startWith(state.order.get(selector.id)?.asReadonlyArray() ?? [])
    );
}
