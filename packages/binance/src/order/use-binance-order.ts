import { map } from 'rxjs';

import { InstrumentSelector, missed, use } from '@quantform/core';

import { useBinanceOrders } from './use-binance-orders';

export const useBinanceOrder = use((id: string, instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    map(it => (it !== missed ? it[id] ?? missed : missed))
  )
);
