import { map, switchMap } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  d,
  eq,
  instrumentNotSupported,
  InstrumentSelector,
  Storage,
  use,
  useSessionObject
} from '@quantform/core';

const object = Storage.createObject('cum-volume', {
  timestamp: 'number',
  aggQuantity: 'decimal',
  rate: 'decimal',
  instrument: 'string'
});

export const useCumulativeVolume = use((instrument: InstrumentSelector) => {
  const state = {
    timestamp: 0,
    aggQuantity: d.Zero,
    rate: d.Zero,
    instrument: instrument.id
  };

  const { query, save } = useSessionObject(object);

  return query({
    limit: 1,
    where: { instrument: eq(instrument.id) },
    orderBy: 'DESC'
  }).pipe(
    switchMap(([it]) => {
      if (it) {
        Object.assign(state, it);

        console.log('loaded volume', state);
      }

      return Binance.useTrade(instrument).pipe(
        map(it => {
          if (it === instrumentNotSupported) {
            return state;
          }

          state.aggQuantity = state.aggQuantity.add(it.quantity.mul(it.rate));
          state.rate = it.rate;

          save([state]);

          return state;
        })
      );
    })
  );
});
