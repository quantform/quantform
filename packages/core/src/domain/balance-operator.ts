import { filter, map, Observable, startWith } from 'rxjs';

import { AssetSelector, Balance, Component } from '@lib/domain';
import { State } from '@lib/store';

export function balance(selector: AssetSelector, state: State) {
  return (source$: Observable<Component>) =>
    source$.pipe(
      startWith(state.balance.get(selector.id)),
      filter(it => it instanceof Balance && (!selector || it.asset.id == selector.id)),
      map(it => it as Balance)
    );
}
