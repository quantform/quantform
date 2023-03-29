import { map, mergeAll, pairwise, startWith } from 'rxjs';

import { Binance } from '@quantform/binance';
import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

export const useOrderSettled = use((instrument: InstrumentSelector) =>
  Binance.useOrders(instrument).pipe(
    map(it => (it === instrumentNotSupported ? [] : Object.values(it))),
    startWith([]),
    pairwise(),
    map(([prev, curr]) => curr.filter(lhs => !prev.find(rhs => lhs.id == rhs.id))),
    mergeAll()
  )
);
