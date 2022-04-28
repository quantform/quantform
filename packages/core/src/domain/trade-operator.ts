import { filter, map, Observable } from 'rxjs';

import { Component } from './component';
import { InstrumentSelector } from './instrument';
import { Trade } from './trade';

export function trade(selector: InstrumentSelector) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      filter(
        it => it instanceof Trade && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Trade)
    );
}
