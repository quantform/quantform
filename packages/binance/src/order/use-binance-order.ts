import { map } from 'rxjs';

import { errored, InstrumentSelector, use } from '@quantform/core';

import { useBinanceOrders } from './use-binance-orders';

export const useBinanceOrder = use((id: string, instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    map(it => (it !== errored ? it[id] ?? errored : errored))
  )
);
