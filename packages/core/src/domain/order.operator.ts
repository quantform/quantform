import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Order } from './order';

export function order(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it instanceof Order && it.instrument.id == selector.id),
      map(it => it as Order)
    );
}

export function orders(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(it => it instanceof Order && it.instrument.id == selector.id),
      map(() => state.order.get(selector.id).asReadonlyArray()),
      startWith(state.order.get(selector.id).asReadonlyArray())
    );
}
