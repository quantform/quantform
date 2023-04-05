import { map } from 'rxjs';

import { InstrumentSelector, notFound, use } from '@quantform/core';

import { useOrders } from './use-orders';

export const useOrder = use((id: string, instrument: InstrumentSelector) =>
  useOrders(instrument).pipe(map(it => (it !== notFound ? it[id] ?? notFound : notFound)))
);
