import { map, switchMap } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  d,
  eq,
  instrumentNotSupported,
  InstrumentSelector,
  use,
  useSessionObject
} from '@quantform/core';

export const useCumulativeVolume = use((instrument: InstrumentSelector) => {
  let volume = d.Zero;

  const { query, save } = useSessionObject('cum-volume', {
    timestamp: 'number',
    aggQuantity: 'decimal',
    rate: 'decimal',
    instrument: 'string'
  });

  return query({ limit: 1 }).pipe(
    switchMap(([it]) => {
      if (it) {
        volume = it.aggQuantity;

        console.log('loaded volume', volume);
      }

      return Binance.useTrade(instrument).pipe(
        map(it => {
          if (it === instrumentNotSupported) {
            return d.Zero;
          }

          volume = volume.add(it.quantity.mul(it.rate));

          save([
            {
              instrument: instrument.id,
              timestamp: it.timestamp,
              aggQuantity: volume,
              rate: it.rate
            }
          ]);

          return {
            aggQuantity: volume,
            rate: it.rate
          };
        })
      );
    })
  );
});
