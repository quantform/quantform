import { filter, map, Observable, startWith } from 'rxjs';

import { State } from '../store';
import { AssetSelector } from './asset';
import { Balance } from './balance';
import { Component } from './component';

export function balance(selector: AssetSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.balance.get(selector.id)),
      filter(it => it instanceof Balance && (!selector || it.asset.id == selector.id)),
      map(it => it as Balance)
    );
}
