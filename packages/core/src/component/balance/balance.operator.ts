import { filter, map, startWith } from 'rxjs';

import { useAdapter } from '@lib/adapter';
import { AssetSelector, Balance } from '@lib/component';
import { useProvider } from '@lib/shared';
import { Store } from '@lib/store';

export function fromBalance(selector: AssetSelector) {
  const store = useProvider<Store>(Store);
  const aggregate = useAdapter(selector.adapterName);

  return store.changes$.pipe(
    startWith(store.snapshot.balance.get(selector.id)),
    filter(it => it !== undefined && it.type === Balance.type),
    map(it => it as Readonly<Balance>),
    filter(it => it.asset.id === selector.id)
  );
}
