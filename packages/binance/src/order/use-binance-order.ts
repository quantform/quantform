import { map } from 'rxjs';

import { InstrumentSelector, use } from '@quantform/core';

import { useBinanceOrders } from './use-binance-orders';

export const useBinanceOrder = use((id: string, instrument: InstrumentSelector) =>
  useBinanceOrders(instrument).pipe(
    map(it => {
      if (!it[id]) {
        throw new Error('missing order id');
      }

      return it[id];
    })
  )
);
