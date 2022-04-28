import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Order, OrderState } from './order';

export function order(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it => it instanceof Order && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Order)
    );
}

export function orders(selector: InstrumentSelector, states: OrderState[], state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it =>
          it instanceof Order &&
          it.instrument.toString() == selector.toString() &&
          (!states || states.includes(it.state))
      ),
      map(() => state.order),
      startWith(state.order),
      map(it =>
        Object.values(it)
          .filter(
            it =>
              it.instrument.toString() == selector.toString() &&
              (states ? states.includes(it.state) : true)
          )
          .sort((lhs, rhs) => rhs.createdAt - lhs.createdAt)
      )
    );
}
