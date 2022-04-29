import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Order } from './order';

export function order(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it => it instanceof Order && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Order)
    );
}

export function orders(selector: InstrumentSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it => it instanceof Order && it.instrument.toString() == selector.toString()
      ),
      map(() => state.order),
      startWith(state.order),
      map(it =>
        Object.values(it)
          .filter(it => it.instrument.toString() == selector.toString())
          .sort((lhs, rhs) => rhs.createdAt - lhs.createdAt)
      )
    );
}
