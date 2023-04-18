import { map } from 'rxjs';

import { InstrumentSelector, notFound, use } from '@quantform/core';

import { useBinanceOrders } from './use-binance-orders';

export const useBinanceOrder = use((id: string, instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    map(it => (it !== notFound ? it[id] ?? notFound : notFound))
  )
);
