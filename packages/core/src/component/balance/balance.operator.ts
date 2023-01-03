import { filter, map, startWith } from 'rxjs';

import { AssetSelector, Balance } from '@lib/component';
import { useStore } from '@lib/store';

export function fromBalance(selector: AssetSelector) {
  const store = useStore();

  return store.changes$.pipe(
    startWith(store.snapshot.balance.get(selector.id)),
    filter(it => it !== undefined && it.type === Balance.type),
    map(it => it as Readonly<Balance>),
    filter(it => it.asset.id === selector.id)
  );
}