import { map, mergeAll, pairwise, startWith } from 'rxjs';

import { useBinanceOrders } from '@quantform/binance';
import { InstrumentSelector, notFound, use } from '@quantform/core';

export const useOrderSettled = use((instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    map(it => (it === notFound ? [] : Object.values(it))),
    startWith([]),
    pairwise(),
    map(([prev, curr]) => curr.filter(lhs => !prev.find(rhs => lhs.id == rhs.id))),
    mergeAll()
  )
);
