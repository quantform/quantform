import { map } from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  d,
  instrumentNotSupported,
  InstrumentSelector,
  withShare
} from '@quantform/core';

export const useCumulativeVolume = withShare((instrument: InstrumentSelector) => {
  let volume = d.Zero;

  return Binance.useTrade(instrument).pipe(
    map(it => {
      if (it === instrumentNotSupported) {
        return d.Zero;
      }

      return (volume = volume.add(it.quantity));
    })
  );
});
