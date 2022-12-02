import { filter, map, Observable, startWith } from 'rxjs';

import { AssetSelector, Balance, Component } from '@lib/domain';
import { State } from '@lib/store';

export function balance(selector: AssetSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.balance.get(selector.id)),
      filter(it => it !== undefined && it.type === Balance.type),
      map(it => it as Balance),
      filter(it => it.asset.id === selector.id)
    );
}
