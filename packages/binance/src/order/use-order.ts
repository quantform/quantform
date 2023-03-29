import { map } from 'rxjs';

import { instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

import { useOrders } from './use-orders';

export const orderNotFound = Symbol('order-not-found');

export const useOrder = use((id: string, instrument: InstrumentSelector) =>
  useOrders(instrument).pipe(
    map(it => (it !== instrumentNotSupported ? it[id] ?? orderNotFound : orderNotFound))
  )
);
