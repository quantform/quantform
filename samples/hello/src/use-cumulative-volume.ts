import { map } from 'rxjs';

import { Binance } from '@quantform/binance';
import { d, instrumentNotSupported, InstrumentSelector, use } from '@quantform/core';

export const useCumulativeVolume = use((instrument: InstrumentSelector) => {
  let volume = d.Zero;

  return Binance.useTrade(instrument).pipe(
    map(it => {
      if (it === instrumentNotSupported) {
        return d.Zero;
      }

      volume = volume.add(it.quantity.mul(it.rate));

      return {
        aggQuantity: volume,
        rate: it.rate
      };
    })
  );
});
