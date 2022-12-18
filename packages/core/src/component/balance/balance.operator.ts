import { filter, map, startWith } from 'rxjs';

import { AssetSelector, Balance } from '@lib/component';
import { useContext } from '@lib/shared';
import { Store } from '@lib/store';

export function fromBalance(selector: AssetSelector) {
  const store = useContext(Store);

  return store.changes$.pipe(
    startWith(store.snapshot.balance.get(selector.id)),
    filter(it => it !== undefined && it.type === Balance.type),
    map(it => it as Readonly<Balance>),
    filter(it => it.asset.id === selector.id)
  );
}
