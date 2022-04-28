import { filter, map, Observable } from 'rxjs';

import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Orderbook } from './orderbook';

export function orderbook(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it => it instanceof Orderbook && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Orderbook)
    );
}
